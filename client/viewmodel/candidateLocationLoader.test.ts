import {beforeEach, describe, expect, it, vi} from "vitest";
import {ApolloClient} from "@apollo/client";

import {CandidateLocationLoader, CandidatePointSink} from "./candidateLocationLoader";
import {CandidateNeuronLocations, CandidateQueryVariables} from "../graphql/candidates";
import {errorNotification} from "../components/common/NotificationHelper";

vi.mock("../components/common/NotificationHelper");

const variables: CandidateQueryVariables = {input: {specimenIds: ["s1"]}, includeInProgress: false, excludedReconstructionStatuses: undefined};

type Deferred = {
    resolve(chunk: CandidateNeuronLocations): void;
    reject(error: Error): void;
};

function fakeClient() {
    const calls: { options: any, deferred: Deferred }[] = [];

    const query = vi.fn((options: any) => new Promise((resolve, reject) => {
        calls.push({
            options,
            deferred: {
                resolve: (chunk: CandidateNeuronLocations) => resolve({data: {candidateNeuronLocations: chunk}}),
                reject
            }
        });
    }));

    return {client: {query} as unknown as ApolloClient<object>, query, calls};
}

function fakeSink() {
    return {clearCandidates: vi.fn(), addCandidates: vi.fn(), removeCandidate: vi.fn()} satisfies CandidatePointSink;
}

function chunk(ids: string[], nextCursor: string | null, totalCount: number | null = null): CandidateNeuronLocations {
    return {ids, locations: ids.map((_, idx) => idx % 2 == 0 ? [idx, idx, idx] : null), nextCursor, totalCount};
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

describe("CandidateLocationLoader", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("walks the cursor until the last chunk, handing each chunk to the sink unchanged", async () => {
        const {client, calls} = fakeClient();
        const sink = fakeSink();
        const loader = new CandidateLocationLoader(client);
        loader.attach(sink);

        const walk = loader.start(variables);

        expect(sink.clearCandidates).toHaveBeenCalledTimes(1);
        expect(loader.isLoading).toBe(true);
        expect(calls[0].options.variables).toEqual({...variables, after: null});
        expect(calls[0].options.fetchPolicy).toBe("no-cache");
        expect(calls[0].options.context).toEqual({queryDeduplication: false});
        expect(calls[0].options.variables.input).not.toHaveProperty("offset");
        expect(calls[0].options.variables).not.toHaveProperty("chunkSize");

        const first = chunk(["a", "b"], "b", 3);
        calls[0].deferred.resolve(first);
        await settle();

        expect(sink.addCandidates).toHaveBeenLastCalledWith(["a", "b"], first.locations);
        expect(loader.total).toBe(3);
        expect(loader.loaded).toBe(2);
        expect(calls[1].options.variables.after).toBe("b");

        calls[1].deferred.resolve(chunk(["c"], null));
        await walk;

        expect(calls).toHaveLength(2);
        expect(loader.loaded).toBe(3);
        expect(loader.total).toBe(3);
        expect(loader.isLoading).toBe(false);
    });

    it("ignores the previous walk's chunks after a restart", async () => {
        const {client, calls} = fakeClient();
        const sink = fakeSink();
        const loader = new CandidateLocationLoader(client);
        loader.attach(sink);

        void loader.start(variables);
        const second = loader.start(variables);

        expect(calls).toHaveLength(2);
        expect(calls[1].options.variables.after).toBeNull();
        expect(sink.clearCandidates).toHaveBeenCalledTimes(2);

        calls[0].deferred.resolve(chunk(["old"], null, 9));
        calls[1].deferred.resolve(chunk(["new"], null, 1));
        await second;

        expect(sink.addCandidates).toHaveBeenCalledTimes(1);
        expect(sink.addCandidates).toHaveBeenCalledWith(["new"], [[0, 0, 0]]);
        expect(loader.total).toBe(1);
    });

    it("stops on cancel", async () => {
        const {client, calls} = fakeClient();
        const sink = fakeSink();
        const loader = new CandidateLocationLoader(client);
        loader.attach(sink);

        const walk = loader.start(variables);
        loader.cancel();

        expect(loader.isLoading).toBe(false);

        calls[0].deferred.resolve(chunk(["a"], "a", 2));
        await walk;

        expect(sink.addCandidates).not.toHaveBeenCalled();
        expect(calls).toHaveLength(1);
    });

    it("drops a removed id and its location from later chunks", async () => {
        const {client, calls} = fakeClient();
        const sink = fakeSink();
        const loader = new CandidateLocationLoader(client);
        loader.attach(sink);

        const walk = loader.start(variables);

        loader.remove("b");

        expect(sink.removeCandidate).toHaveBeenCalledWith("b");

        calls[0].deferred.resolve({ids: ["a", "b", "c"], locations: [[1, 1, 1], [2, 2, 2], [3, 3, 3]], nextCursor: null, totalCount: 3});
        await walk;

        expect(sink.addCandidates).toHaveBeenCalledWith(["a", "c"], [[1, 1, 1], [3, 3, 3]]);
        expect(loader.loaded).toBe(3);
    });

    it("reports an error and stops loading without throwing", async () => {
        const {client, calls} = fakeClient();
        const loader = new CandidateLocationLoader(client);
        loader.attach(fakeSink());

        const walk = loader.start(variables);

        calls[0].deferred.reject(new Error("offline"));
        await walk;

        expect(errorNotification).toHaveBeenCalledTimes(1);
        expect(loader.isLoading).toBe(false);
    });
});
