export enum TracingStructure {
    axon = 1,       // Must match value used in API
    dendrite = 2,   // Must match value used in API
    soma = 3,       // UI-only for selected what to display for a neuron
    all = 4,        // Same as above
    any = -1        // No selection - used for "axonal end point" combinations in query not part of neuron display
}

export interface ITracingStructure {
    id: string;
    name: string;
    value: number;
}
const adjectives = ["", "axonal ", "dendritic "];

export class TracingStructures {
    private static _soma: ITracingStructure = {
        id: "",
        name: "soma",
        value: TracingStructure.soma
    };

    public static get Soma(): ITracingStructure {
        return TracingStructures._soma;
    }
}

export function displayTracingStructure(tracingStructure: ITracingStructure, isAdjective = false): string {
    if (isAdjective) {
        return tracingStructure ? adjectives[tracingStructure.value] : "(none)";
    } else {
        return tracingStructure ? tracingStructure.name : "(none)";
    }
}
