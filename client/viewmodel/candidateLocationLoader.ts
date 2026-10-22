import {ApolloClient} from "@apollo/client";
import {action, makeObservable, observable, runInAction} from "mobx";

import {
    CANDIDATE_NEURON_LOCATIONS_QUERY,
    CandidateNeuronLocationsResponse,
    CandidateNeuronLocationsVariables,
    CandidateQueryVariables
} from "../graphql/candidates";
import {errorNotification} from "../components/common/NotificationHelper";

// Locations arrive as raw [x, y, z] microns, or null; the sink owns any conversion, so a later sink can route points by
// atlas without the loader changing.
export interface CandidatePointSink {
    clearCandidates(): void;

    addCandidates(ids: string[], locations: (number[] | null)[]): void;

    removeCandidate(id: string): void;
}

export class CandidateLocationLoader {
    public loaded = 0;
    public total: number | null = null;
    public isLoading = false;

    private generation = 0;
    private sink: CandidatePointSink | null = null;
    private readonly suppressed = new Set<string>();

    public constructor(private readonly client: ApolloClient<object>) {
        makeObservable(this, {
            loaded: observable,
            total: observable,
            isLoading: observable,
            cancel: action
        });
    }

    public attach(sink: CandidatePointSink): void {
        this.sink = sink;
    }

    public detach(): void {
        this.sink = null;
    }

    public async start(variables: CandidateQueryVariables): Promise<void> {
        const generation = ++this.generation;

        this.suppressed.clear();
        this.sink?.clearCandidates();

        runInAction(() => {
            this.loaded = 0;
            this.total = null;
            this.isLoading = true;
        });

        let after: string | null = null;

        try {
            do {
                const {data} = await this.client.query<CandidateNeuronLocationsResponse, CandidateNeuronLocationsVariables>({
                    query: CANDIDATE_NEURON_LOCATIONS_QUERY,
                    variables: {...variables, after},
                    fetchPolicy: "no-cache",
                    // Unmerged, or a refresh's first chunk could share the previous walk's identical in-flight request.
                    context: {queryDeduplication: false}
                });

                if (generation !== this.generation) {
                    return;
                }

                const chunk = data.candidateNeuronLocations;

                const ids: string[] = [];
                const locations: (number[] | null)[] = [];

                chunk.ids.forEach((id, idx) => {
                    if (!this.suppressed.has(id)) {
                        ids.push(id);
                        locations.push(chunk.locations[idx]);
                    }
                });

                this.sink?.addCandidates(ids, locations);

                const isFirst = after === null;

                runInAction(() => {
                    if (isFirst) {
                        this.total = chunk.totalCount;
                    }

                    this.loaded += chunk.ids.length;
                });

                after = chunk.nextCursor;
            } while (after !== null);
        } catch (error) {
            if (generation === this.generation) {
                errorNotification("Soma Locations Could Not Be Loaded", error);
            }
        } finally {
            if (generation === this.generation) {
                runInAction(() => this.isLoading = false);
            }
        }
    }

    public cancel(): void {
        this.generation++;
        this.isLoading = false;
    }

    public remove(id: string): void {
        this.suppressed.add(id);
        this.sink?.removeCandidate(id);
    }
}
