import {ApolloClient, ApolloError} from "@apollo/client";
import {action, makeObservable, observable, runInAction} from "mobx";
import {debounce} from "lodash-es";

import {NeuronShape} from "../models/neuron";
import {
    CANDIDATE_NEURON_OFFSET_QUERY,
    CANDIDATE_NEURONS_QUERY,
    CandidateNeuronOffsetResponse,
    CandidateNeuronOffsetVariables,
    CandidateNeuronsQueryVariables,
    CandidateNeuronsResponse,
    CandidateQueryVariables,
    NeuronsQueryData
} from "../graphql/candidates";
import {CandidateBlockSize, CandidateRowBuffer} from "./candidateRowBuffer";
import {errorNotification} from "../components/common/NotificationHelper";

const FetchOverscanBlocks = 1;

const RangeFetchDelayMs = 100;

// Apollo merges a query into an identical in-flight one even under no-cache, so a refresh or forced reload would
// otherwise receive the response of the request it was meant to replace.
const UnmergedQuery = {queryDeduplication: false};

export type LocateResult =
    { kind: "found", offset: number }
    | { kind: "notCandidate" }
    | { kind: "notFound" }
    | { kind: "failed" }
    | { kind: "superseded" };

type BlockOutcome = "stored" | "failed" | "superseded";

export class CandidateTableViewModel {
    // Display state: kept across a reset until the new generation's first response.
    public totalCount: number | null = null;
    public version = 0;
    public selectedId: string | null = null;
    public selectedNeuron: NeuronShape | null = null;
    public loadError: ApolloError | null = null;

    private variables: CandidateQueryVariables | null = null;
    private generation = 0;
    private selectionToken = 0;
    private readonly inFlight = new Map<number, Promise<BlockOutcome>>();
    private readonly pinned = new Map<number, number>();
    // The count confirmed in this generation; every fetch decision uses it, never the retained display count.
    private knownCount: number | null = null;
    private range: [number, number] = [0, CandidateBlockSize - 1];
    private readonly ensureRangeDebounced = debounce(() => this.ensureRange(), RangeFetchDelayMs);

    public constructor(private readonly client: ApolloClient<object>, private readonly buffer: CandidateRowBuffer = new CandidateRowBuffer()) {
        makeObservable(this, {
            totalCount: observable,
            version: observable,
            selectedId: observable,
            selectedNeuron: observable.ref,
            loadError: observable.ref,
            reset: action,
            selectRow: action
        });
    }

    public rowAt(offset: number): NeuronShape | undefined {
        return this.buffer.get(offset);
    }

    public showRange(first: number, last: number): void {
        this.range = [first, last];

        this.ensureRangeDebounced();
    }

    public reset(variables: CandidateQueryVariables, scrollToTop: boolean): void {
        this.variables = variables;

        this.generation++;
        this.inFlight.clear();
        this.knownCount = null;
        this.loadError = null;
        this.ensureRangeDebounced.cancel();

        this.buffer.clear();
        this.version++;

        if (scrollToTop) {
            this.range = [0, this.range[1] - this.range[0]];
        }

        this.ensureRange();

        if (this.selectedId !== null) {
            void this.revalidateSelection();
        }
    }

    public selectRow(neuron: NeuronShape | null): void {
        this.selectionToken++;

        if (!neuron || neuron.id === this.selectedId) {
            this.selectedId = null;
            this.selectedNeuron = null;
        } else {
            this.selectedId = neuron.id;
            this.selectedNeuron = neuron;
        }
    }

    public async selectFromViewer(id: string): Promise<number | null> {
        const token = ++this.selectionToken;

        const buffered = this.buffer.indexOf(id);

        runInAction(() => {
            this.selectedId = id;
            this.selectedNeuron = buffered === undefined ? null : this.buffer.get(buffered);
        });

        if (buffered !== undefined) {
            return buffered;
        }

        const result = await this.locate(id, false, () => token === this.selectionToken);

        if (token !== this.selectionToken || result.kind === "superseded") {
            return null;
        }

        if (result.kind !== "found") {
            runInAction(() => this.clearSelection());
            return null;
        }

        runInAction(() => this.selectedNeuron = this.buffer.get(result.offset) ?? this.selectedNeuron);

        return result.offset;
    }

    // Resolves true when the neuron was removed, so the caller can drop its viewer point.  Only a null offset justifies
    // a removal; a failed lookup proves nothing about the neuron.
    public async handleReconstructionStarted(id: string, includeInProgress: boolean): Promise<boolean> {
        if (!includeInProgress) {
            this.removeCandidate(id);
            return true;
        }

        const result = await this.locate(id, true);

        if (result.kind === "notCandidate") {
            this.removeCandidate(id);
            return true;
        }

        if (result.kind === "found" && this.selectedId === id) {
            runInAction(() => this.selectedNeuron = this.buffer.get(result.offset) ?? this.selectedNeuron);
        }

        return false;
    }

    public dispose(): void {
        this.generation++;
        this.ensureRangeDebounced.cancel();
    }

    private get blockSize(): number {
        return this.buffer.blockSize;
    }

    private blocksFor(range: [number, number]): number[] {
        const first = Math.max(0, Math.floor(range[0] / this.blockSize) - FetchOverscanBlocks);
        let last = Math.floor(range[1] / this.blockSize) + FetchOverscanBlocks;

        if (this.knownCount !== null) {
            last = Math.min(last, Math.ceil(this.knownCount / this.blockSize) - 1);
        }

        const blocks: number[] = [];

        for (let block = first; block <= last; block++) {
            blocks.push(block);
        }

        return blocks;
    }

    private protectedBlocks(): Set<number> {
        return new Set([...this.blocksFor(this.range), ...this.pinned.keys()]);
    }

    private ensureRange(): void {
        if (this.variables === null) {
            return;
        }

        const blocks = this.blocksFor(this.range);

        this.buffer.touch(blocks);

        for (const block of blocks) {
            if (!this.inFlight.has(block) && !this.buffer.isBlockComplete(block, this.knownCount)) {
                void this.fetchBlock(block);
            }
        }
    }

    private fetchBlock(block: number, force: boolean = false): Promise<BlockOutcome> {
        const registered = this.inFlight.get(block);

        if (registered && !force) {
            return registered;
        }

        const generation = this.generation;
        const variables = this.variables;
        const offset = block * this.blockSize;

        let request: Promise<BlockOutcome>;

        const isCurrent = () => generation === this.generation && this.inFlight.get(block) === request;

        request = (async (): Promise<BlockOutcome> => {
            try {
                const {data} = await this.client.query<CandidateNeuronsResponse, CandidateNeuronsQueryVariables>({
                    query: CANDIDATE_NEURONS_QUERY,
                    variables: {...variables, input: {...variables.input, offset, limit: this.blockSize}},
                    fetchPolicy: "no-cache",
                    context: UnmergedQuery
                });

                if (!isCurrent()) {
                    return "superseded";
                }

                runInAction(() => this.storeBlock(offset, data.candidateNeurons));

                return "stored";
            } catch (error) {
                if (!isCurrent()) {
                    return "superseded";
                }

                runInAction(() => {
                    if (this.knownCount === null) {
                        this.loadError = error;
                    } else {
                        errorNotification("Candidate Rows Could Not Be Loaded", error);
                    }
                });

                return "failed";
            } finally {
                if (this.inFlight.get(block) === request) {
                    this.inFlight.delete(block);
                }
            }
        })();

        this.inFlight.set(block, request);

        return request;
    }

    private storeBlock(offset: number, {totalCount, items}: NeuronsQueryData): void {
        // A count that moved means the server's candidate set changed, so every other buffered row may have shifted.
        const drift = this.knownCount !== null && totalCount !== this.knownCount;

        if (drift) {
            this.buffer.clear();
        }

        this.buffer.store(offset, items);

        this.knownCount = totalCount;
        this.totalCount = totalCount;
        this.loadError = null;

        const selected = items.find(neuron => neuron.id === this.selectedId);

        if (selected) {
            this.selectedNeuron = selected;
        }

        this.buffer.evict(this.protectedBlocks());

        this.version++;

        if (drift) {
            this.ensureRange();
        }
    }

    private async locate(id: string, reload: boolean = false, isCurrent: () => boolean = () => true): Promise<LocateResult> {
        const generation = this.generation;

        let windowLoaded = false;

        for (let attempt = 0; attempt < 2; attempt++) {
            let offset: number | null;

            try {
                const {data} = await this.client.query<CandidateNeuronOffsetResponse, CandidateNeuronOffsetVariables>({
                    query: CANDIDATE_NEURON_OFFSET_QUERY,
                    variables: {...this.variables, id},
                    fetchPolicy: "no-cache",
                    context: UnmergedQuery
                });

                offset = data.candidateNeuronOffset;
            } catch (error) {
                if (generation !== this.generation || !isCurrent()) {
                    return {kind: "superseded"};
                }

                errorNotification("Candidate Could Not Be Located", error);

                return {kind: "failed"};
            }

            if (generation !== this.generation || !isCurrent()) {
                return {kind: "superseded"};
            }

            if (offset === null) {
                return {kind: "notCandidate"};
            }

            const center = Math.floor(offset / this.blockSize);
            const blocks = this.blocksAround(center);

            // Pinned so a full buffer can't evict the window before it has been searched.
            this.pin(blocks);

            try {
                const outcomes = await Promise.all(blocks.map(block => {
                    if (block === center) {
                        return this.fetchBlock(block, reload);
                    }

                    return this.buffer.isBlockComplete(block, this.knownCount) ? Promise.resolve<BlockOutcome>("stored") : this.fetchBlock(block);
                }));

                if (generation !== this.generation) {
                    return {kind: "superseded"};
                }

                if (outcomes.includes("failed")) {
                    return {kind: "failed"};
                }

                const found = this.buffer.indexOf(id);

                if (found !== undefined) {
                    return {kind: "found", offset: found};
                }

                // A superseded outcome means a newer request for that block is still on its way, so its absence from
                // this window proves nothing.
                windowLoaded = outcomes.every(outcome => outcome === "stored");
            } finally {
                this.unpin(blocks);
            }
        }

        return windowLoaded ? {kind: "notFound"} : {kind: "failed"};
    }

    private blocksAround(center: number): number[] {
        const lastBlock = this.knownCount === null ? Infinity : Math.ceil(this.knownCount / this.blockSize) - 1;

        return [center - 1, center, center + 1].filter(block => block === center || (block >= 0 && block <= lastBlock));
    }

    private pin(blocks: number[]): void {
        for (const block of blocks) {
            this.pinned.set(block, (this.pinned.get(block) ?? 0) + 1);
        }
    }

    // Pins can hold the buffer over its limit, so releasing them must evict again to restore the bound.
    private unpin(blocks: number[]): void {
        for (const block of blocks) {
            const count = (this.pinned.get(block) ?? 1) - 1;

            if (count > 0) {
                this.pinned.set(block, count);
            } else {
                this.pinned.delete(block);
            }
        }

        const size = this.buffer.size;

        this.buffer.evict(this.protectedBlocks());

        if (this.buffer.size !== size) {
            runInAction(() => this.version++);
        }
    }

    private async revalidateSelection(): Promise<void> {
        const id = this.selectedId;
        const token = this.selectionToken;

        const result = await this.locate(id, false, () => token === this.selectionToken);

        if (token !== this.selectionToken) {
            return;
        }

        runInAction(() => {
            if (result.kind === "found") {
                this.selectedNeuron = this.buffer.get(result.offset) ?? this.selectedNeuron;
            } else if (result.kind === "notCandidate") {
                this.clearSelection();
            }
        });
    }

    private removeCandidate(id: string): void {
        runInAction(() => {
            this.generation++;
            this.inFlight.clear();
            this.ensureRangeDebounced.cancel();

            // Without the neuron's position, every row after it may have moved.
            if (!this.buffer.remove(id)) {
                this.buffer.clear();
            }

            if (this.knownCount !== null) {
                this.knownCount = Math.max(0, this.knownCount - 1);
            }

            if (this.totalCount !== null) {
                this.totalCount = Math.max(0, this.totalCount - 1);
            }

            if (this.selectedId === id) {
                this.clearSelection();
            }

            this.version++;

            this.ensureRange();
        });
    }

    private clearSelection(): void {
        this.selectionToken++;
        this.selectedId = null;
        this.selectedNeuron = null;
    }
}
