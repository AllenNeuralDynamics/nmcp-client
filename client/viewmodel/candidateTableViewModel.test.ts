import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {ApolloClient} from "@apollo/client";

import {CandidateTableViewModel} from "./candidateTableViewModel";
import {CandidateRowBuffer} from "./candidateRowBuffer";
import {CANDIDATE_NEURON_OFFSET_QUERY, CANDIDATE_NEURONS_QUERY, CandidateQueryVariables} from "../graphql/candidates";
import {NeuronShape} from "../models/neuron";
import {errorNotification} from "../components/common/NotificationHelper";

vi.mock("../components/common/NotificationHelper");

const variables: CandidateQueryVariables = {input: {specimenIds: ["s1"]}, includeInProgress: false, excludedReconstructionStatuses: undefined};

const otherVariables: CandidateQueryVariables = {input: {specimenIds: ["s2"]}, includeInProgress: false, excludedReconstructionStatuses: undefined};

type Call = {
    options: any;
    resolve(value: any): void;
    reject(error: Error): void;
    done: boolean;
};

// Answers row windows and offsets from an ordered id list, the way the API sorts candidates.  Every call stays pending
// until a test answers it, directly or through serve().
class FakeServer {
    public ids: string[];
    public tag = "v1";
    public calls: Call[] = [];
    public offsetOf: ((id: string) => number | null) | null = null;
    public rowIds: string[] | null = null;
    public readonly failingOffsets = new Set<number>();
    public failOffsetQuery = false;

    public readonly client: ApolloClient<object>;

    public constructor(count: number) {
        this.ids = idsUpTo(count);

        const query = vi.fn((options: any) => new Promise((resolve, reject) => {
            this.calls.push({options, resolve, reject, done: false});
        }));

        this.client = {query} as unknown as ApolloClient<object>;
    }

    public pendingRows(): Call[] {
        return this.calls.filter(call => !call.done && call.options.query === CANDIDATE_NEURONS_QUERY);
    }

    public pendingOffsets(): Call[] {
        return this.calls.filter(call => !call.done && call.options.query === CANDIDATE_NEURON_OFFSET_QUERY);
    }

    public rowCalls(): Call[] {
        return this.calls.filter(call => call.options.query === CANDIDATE_NEURONS_QUERY);
    }

    public offsetCalls(): Call[] {
        return this.calls.filter(call => call.options.query === CANDIDATE_NEURON_OFFSET_QUERY);
    }

    public answerRows(call: Call, tag: string = this.tag): void {
        const {offset, limit} = call.options.variables.input;
        const source = this.rowIds ?? this.ids;

        call.done = true;
        call.resolve({
            data: {
                candidateNeurons: {
                    totalCount: this.ids.length,
                    offset,
                    items: source.slice(offset, offset + limit).map(id => ({id, label: tag}))
                }
            }
        });
    }

    public answerOffset(call: Call, offset: number | null): void {
        call.done = true;
        call.resolve({data: {candidateNeuronOffset: offset}});
    }

    public fail(call: Call): void {
        call.done = true;
        call.reject(new Error("request failed"));
    }

    public answer(call: Call): void {
        if (call.options.query === CANDIDATE_NEURONS_QUERY) {
            if (this.failingOffsets.has(call.options.variables.input.offset)) {
                this.fail(call);
            } else {
                this.answerRows(call);
            }
        } else if (this.failOffsetQuery) {
            this.fail(call);
        } else {
            const id = call.options.variables.id;
            const index = this.ids.indexOf(id);

            this.answerOffset(call, this.offsetOf ? this.offsetOf(id) : (index >= 0 ? index : null));
        }
    }

    public async serve(): Promise<void> {
        for (let round = 0; round < 100; round++) {
            await flush();

            const pending = this.calls.filter(call => !call.done);

            if (pending.length === 0) {
                return;
            }

            pending.forEach(call => this.answer(call));
        }

        throw new Error("The fake server never settled.");
    }
}

function idsUpTo(count: number): string[] {
    return Array.from({length: count}, (_, idx) => `n${idx}`);
}

function offsetsOf(calls: Call[]): number[] {
    return calls.map(call => call.options.variables.input.offset);
}

async function flush(): Promise<void> {
    for (let idx = 0; idx < 20; idx++) {
        await Promise.resolve();
    }
}

async function loaded(count: number, buffer?: CandidateRowBuffer) {
    const server = new FakeServer(count);
    const model = new CandidateTableViewModel(server.client, buffer);

    model.reset(variables, true);
    await server.serve();

    return {server, model};
}

describe("CandidateTableViewModel", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("loading", () => {
        it("fetches the first blocks on reset, uncached and unmerged", async () => {
            const server = new FakeServer(120);
            const model = new CandidateTableViewModel(server.client);

            model.reset(variables, true);

            const calls = server.pendingRows();

            expect(offsetsOf(calls)).toEqual([0, 50]);

            for (const call of calls) {
                expect(call.options.variables).toEqual({...variables, input: {...variables.input, offset: call.options.variables.input.offset, limit: 50}});
                expect(call.options.fetchPolicy).toBe("no-cache");
                expect(call.options.context).toEqual({queryDeduplication: false});
            }

            await server.serve();

            expect(model.totalCount).toBe(120);
            expect(model.rowAt(0).id).toBe("n0");
            expect(model.rowAt(99).id).toBe("n99");
            expect(model.rowAt(100)).toBeUndefined();
        });

        it("issues a new request on refresh rather than reusing an identical one in flight", async () => {
            const server = new FakeServer(120);
            const model = new CandidateTableViewModel(server.client);

            model.reset(variables, true);
            model.reset(variables, false);

            const blockZero = server.pendingRows().filter(call => call.options.variables.input.offset === 0);

            expect(blockZero).toHaveLength(2);

            server.answerRows(blockZero[0], "old");
            await flush();

            expect(model.rowAt(0)).toBeUndefined();

            server.answerRows(blockZero[1], "new");
            await flush();

            expect(model.rowAt(0).label).toBe("new");
        });

        it("fetches only the settled range after scrolling", async () => {
            const {server, model} = await loaded(1000);

            model.showRange(400, 409);
            vi.advanceTimersByTime(50);
            model.showRange(600, 609);

            expect(server.pendingRows()).toHaveLength(0);

            vi.advanceTimersByTime(100);

            expect(offsetsOf(server.pendingRows())).toEqual([550, 600, 650]);

            await server.serve();

            const requests = server.rowCalls().length;

            model.showRange(610, 619);
            vi.advanceTimersByTime(100);

            expect(server.rowCalls()).toHaveLength(requests);
        });

        it("drops responses that arrive after a reset", async () => {
            const server = new FakeServer(120);
            const model = new CandidateTableViewModel(server.client);

            model.reset(variables, true);

            const stale = server.pendingRows();

            model.reset(otherVariables, true);

            stale.forEach(call => server.answerRows(call, "stale"));
            await server.serve();

            expect(model.rowAt(0).label).toBe("v1");
        });

        it("fetches the new filter's rows after an empty result", async () => {
            const {server, model} = await loaded(0);

            expect(model.totalCount).toBe(0);

            server.ids = idsUpTo(30);
            model.reset(otherVariables, true);

            expect(model.totalCount).toBe(0);
            expect(offsetsOf(server.pendingRows())).toContain(0);

            await server.serve();

            expect(model.totalCount).toBe(30);
            expect(model.rowAt(0).id).toBe("n0");
        });

        it("fetches past the retained display count while the new count is unknown", async () => {
            const {server, model} = await loaded(20);

            model.reset(otherVariables, false);
            model.showRange(200, 209);
            vi.advanceTimersByTime(100);

            expect(offsetsOf(server.pendingRows())).toEqual(expect.arrayContaining([150, 200, 250]));
        });

        it("clears shifted rows and refetches the range when the count moves", async () => {
            const {server, model} = await loaded(1000);

            model.showRange(500, 509);
            vi.advanceTimersByTime(100);

            const [block9, block10, block11] = server.pendingRows();

            server.answerRows(block10);
            server.answerRows(block11);
            await flush();

            server.ids = server.ids.filter(id => id !== "n3");

            server.answerRows(block9);
            await flush();

            expect(model.totalCount).toBe(999);
            expect(model.rowAt(0)).toBeUndefined();
            expect(model.rowAt(450).id).toBe("n451");
            expect(offsetsOf(server.pendingRows())).toEqual([500, 550]);
        });
    });

    describe("selection", () => {
        it("selects a row and toggles it off", async () => {
            const {model} = await loaded(120);

            model.selectRow(model.rowAt(5));

            expect(model.selectedId).toBe("n5");
            expect(model.selectedNeuron.id).toBe("n5");

            model.selectRow(model.rowAt(5));

            expect(model.selectedId).toBeNull();
            expect(model.selectedNeuron).toBeNull();
        });

        it("returns a buffered row's offset without a query", async () => {
            const {server, model} = await loaded(120);

            expect(await model.selectFromViewer("n5")).toBe(5);
            expect(model.selectedNeuron.id).toBe("n5");
            expect(server.offsetCalls()).toHaveLength(0);
        });

        it("locates an unbuffered row by id, not by the offset alone", async () => {
            const {server, model} = await loaded(1000);

            server.offsetOf = () => 699;

            const selection = model.selectFromViewer("n700");

            expect(model.selectedId).toBe("n700");
            expect(model.selectedNeuron).toBeNull();

            await server.serve();

            expect(await selection).toBe(700);
            expect(model.selectedNeuron.id).toBe("n700");

            const lookup = server.offsetCalls()[0].options;

            expect(lookup.variables).toEqual({...variables, id: "n700"});
            expect(lookup.context).toEqual({queryDeduplication: false});
            expect(offsetsOf(server.rowCalls().slice(-3))).toEqual([600, 650, 700]);
        });

        it("clears the selection for a neuron that is no longer a candidate", async () => {
            const {server, model} = await loaded(1000);

            server.offsetOf = () => null;

            const selection = model.selectFromViewer("n700");
            await server.serve();

            expect(await selection).toBeNull();
            expect(model.selectedId).toBeNull();
        });

        it("clears the selection and reports a failed lookup", async () => {
            const {server, model} = await loaded(1000);

            server.failOffsetQuery = true;

            const selection = model.selectFromViewer("n700");
            await server.serve();

            expect(await selection).toBeNull();
            expect(model.selectedId).toBeNull();
            expect(errorNotification).toHaveBeenCalled();
        });

        it("treats a failed window as a failure, not a removal", async () => {
            const {server, model} = await loaded(1000);

            [600, 650, 700].forEach(offset => server.failingOffsets.add(offset));

            const selection = model.selectFromViewer("n700");
            await server.serve();

            expect(await selection).toBeNull();
            expect(model.selectedId).toBeNull();
            expect(server.offsetCalls()).toHaveLength(1);
            expect(model.totalCount).toBe(1000);
            expect(model.rowAt(5).id).toBe("n5");
            expect(model.loadError).toBeNull();
        });

        it("gives way to a later selection", async () => {
            const {server, model} = await loaded(1000);

            const selection = model.selectFromViewer("n700");

            model.selectRow(model.rowAt(3));
            await server.serve();

            expect(await selection).toBeNull();
            expect(model.selectedId).toBe("n3");
        });

        it("fetches no blocks for a lookup superseded before its offset arrives", async () => {
            const {server, model} = await loaded(1000);

            const requests = server.rowCalls().length;

            const selection = model.selectFromViewer("n800");

            model.selectRow(model.rowAt(3));
            await server.serve();

            expect(await selection).toBeNull();
            expect(server.rowCalls()).toHaveLength(requests);
        });

        it("keeps a lookup's window through evictions in a full buffer, then restores the bound", async () => {
            const buffer = new CandidateRowBuffer(50, 200);
            const {server, model} = await loaded(1000, buffer);

            model.showRange(100, 149);
            vi.advanceTimersByTime(100);
            await server.serve();

            expect(buffer.size).toBe(200);

            const selection = model.selectFromViewer("n800");
            await server.serve();

            expect(await selection).toBe(800);
            expect(model.selectedNeuron.id).toBe("n800");
            expect(server.offsetCalls()).toHaveLength(1);
            expect(buffer.size).toBeLessThanOrEqual(200);
        });

        it("restores the bound once many concurrent lookups settle", async () => {
            const buffer = new CandidateRowBuffer(50, 100);
            const {server, model} = await loaded(5000, buffer);

            const lookups = Array.from({length: 15}, (_, idx) => model.handleReconstructionStarted(`n${300 + idx * 300}`, true));

            await server.serve();
            await Promise.all(lookups);

            expect(buffer.size).toBeLessThanOrEqual(100);
        });
    });

    describe("revalidating the selection on reset", () => {
        it("clears a selection that is no longer a candidate", async () => {
            const {server, model} = await loaded(120);

            model.selectRow(model.rowAt(5));
            server.offsetOf = () => null;

            model.reset(otherVariables, true);
            await server.serve();

            expect(model.selectedId).toBeNull();
        });

        it("keeps a selection that is still a candidate, with fresh detail", async () => {
            const {server, model} = await loaded(120);

            model.selectRow(model.rowAt(5));
            server.tag = "v2";

            model.reset(variables, false);
            await server.serve();

            expect(model.selectedId).toBe("n5");
            expect(model.selectedNeuron.label).toBe("v2");
        });

        it("keeps the selection when the lookup fails", async () => {
            const {server, model} = await loaded(120);

            model.selectRow(model.rowAt(5));
            server.failOffsetQuery = true;

            model.reset(variables, false);
            await server.serve();

            expect(model.selectedId).toBe("n5");
        });

        it("keeps the selection when its window fails to load", async () => {
            const {server, model} = await loaded(120);

            model.selectRow(model.rowAt(5));
            server.failingOffsets.add(0);

            model.reset(variables, false);
            await server.serve();

            expect(model.selectedId).toBe("n5");
        });
    });

    describe("starting a reconstruction", () => {
        it("removes the neuron locally when in-progress candidates are excluded", async () => {
            const {server, model} = await loaded(120);

            model.selectRow(model.rowAt(5));
            model.showRange(100, 109);
            vi.advanceTimersByTime(100);

            const inFlight = server.pendingRows();
            const lookups = server.offsetCalls().length;

            expect(await model.handleReconstructionStarted("n5", false)).toBe(true);

            expect(model.totalCount).toBe(119);
            expect(model.rowAt(5).id).toBe("n6");
            expect(model.selectedId).toBeNull();
            expect(server.offsetCalls()).toHaveLength(lookups);

            inFlight.forEach(call => server.answerRows(call, "stale"));
            await flush();

            expect(model.rowAt(100)?.label).not.toBe("stale");
        });

        it("reloads the row, even from a complete block, when in-progress candidates are included", async () => {
            const {server, model} = await loaded(120);

            model.selectRow(model.rowAt(5));
            server.tag = "v2";

            const requests = server.rowCalls().length;

            const started = model.handleReconstructionStarted("n5", true);
            await server.serve();

            expect(await started).toBe(false);
            expect(offsetsOf(server.rowCalls().slice(requests))).toContain(0);
            expect(model.selectedNeuron.label).toBe("v2");
            expect(model.rowAt(5).label).toBe("v2");
        });

        it("removes the neuron when the reload finds it is no longer a candidate", async () => {
            const {server, model} = await loaded(120);

            server.ids = server.ids.filter(id => id !== "n5");

            const started = model.handleReconstructionStarted("n5", true);
            await server.serve();

            expect(await started).toBe(true);
            expect(model.totalCount).toBe(119);
        });

        it("removes nothing when the reload's window fails", async () => {
            const {server, model} = await loaded(120);

            model.selectRow(model.rowAt(5));
            server.failingOffsets.add(0);
            server.failingOffsets.add(50);

            const started = model.handleReconstructionStarted("n5", true);
            await server.serve();

            expect(await started).toBe(false);
            expect(server.offsetCalls()).toHaveLength(1);
            expect(model.totalCount).toBe(120);
            expect(model.selectedId).toBe("n5");
            expect(model.selectedNeuron.label).toBe("v1");
            expect(model.rowAt(5).id).toBe("n5");
        });

        it("removes nothing when the windows load without the neuron", async () => {
            const {server, model} = await loaded(120);

            server.offsetOf = () => 5;
            server.rowIds = server.ids.map(id => id === "n5" ? "replacement" : id);

            const started = model.handleReconstructionStarted("n5", true);
            await server.serve();

            expect(await started).toBe(false);
            expect(model.totalCount).toBe(120);
        });

        it("concludes nothing from a superseded block and finds the row on retry", async () => {
            const server = new FakeServer(120);
            const model = new CandidateTableViewModel(server.client);

            model.reset(variables, true);

            const first = model.handleReconstructionStarted("n5", true);
            const second = model.handleReconstructionStarted("n6", true);

            await server.serve();

            expect(await first).toBe(false);
            expect(await second).toBe(false);
            expect(model.totalCount).toBe(120);
            expect(model.rowAt(5).id).toBe("n5");
        });

        it.each(["earlier first", "forced first"])("keeps the forced reload's data when the responses arrive %s", async order => {
            const server = new FakeServer(120);
            const model = new CandidateTableViewModel(server.client);

            model.reset(variables, true);
            model.selectRow({id: "n5", label: "seed"} as NeuronShape);

            const [earlier, blockOne] = server.pendingRows();

            server.answerRows(blockOne);
            await flush();

            const started = model.handleReconstructionStarted("n5", true);
            await flush();

            server.answerOffset(server.pendingOffsets()[0], 5);
            await flush();

            const forced = server.pendingRows().find(call => call !== earlier && call.options.variables.input.offset === 0);

            expect(forced).toBeDefined();

            model.showRange(0, 9);
            vi.advanceTimersByTime(100);

            expect(server.pendingRows()).toHaveLength(2);

            if (order === "earlier first") {
                server.answerRows(earlier, "stale");
                await flush();

                model.showRange(1, 10);
                vi.advanceTimersByTime(100);

                expect(server.pendingRows()).toEqual([forced]);

                server.answerRows(forced, "fresh");
            } else {
                server.answerRows(forced, "fresh");
                await flush();

                server.answerRows(earlier, "stale");
            }

            await flush();

            expect(await started).toBe(false);
            expect(model.rowAt(5).label).toBe("fresh");
            expect(model.selectedNeuron.label).toBe("fresh");
        });
    });

    describe("errors", () => {
        it("records a failed first load", async () => {
            const server = new FakeServer(120);
            const model = new CandidateTableViewModel(server.client);

            model.reset(variables, true);

            server.fail(server.pendingRows()[0]);
            await flush();

            expect(model.loadError).toBeInstanceOf(Error);
        });

        it("reports a later block failure and fetches the block again when it is next needed", async () => {
            const {server, model} = await loaded(1000);

            model.showRange(500, 509);
            vi.advanceTimersByTime(100);

            server.failingOffsets.add(500);
            await server.serve();

            expect(errorNotification).toHaveBeenCalled();
            expect(model.loadError).toBeNull();

            server.failingOffsets.clear();

            model.showRange(501, 510);
            vi.advanceTimersByTime(100);

            expect(offsetsOf(server.pendingRows())).toEqual([500]);
        });

        it("records a failed reload even while the previous count is displayed, and clears it on retry", async () => {
            const {server, model} = await loaded(120);

            model.reset(variables, false);

            expect(model.loadError).toBeNull();
            expect(model.totalCount).toBe(120);

            server.fail(server.pendingRows()[0]);
            await flush();

            expect(model.loadError).toBeInstanceOf(Error);
            expect(model.totalCount).toBe(120);

            model.reset(variables, false);

            expect(model.loadError).toBeNull();

            await server.serve();

            expect(model.rowAt(0).id).toBe("n0");
        });
    });
});
