export enum NeuronStructureKind {
    axon = 1,
    dendrite = 2,
    soma = 3,       // UI-only for selected what to display for a neuron
    all = 4,        // Same as above
    any = -1        // No selection - used for "axonal end point" combinations in query not part of neuron display
}

export type NeuronStructureShape = {
    id: string;
    name: NeuronStructureKey;
}

// Keys must match NeuronStructureShape name property value from API.
export type NeuronStructureKey = "axon" | "dendrite" | "soma";

export const AxonStructureName = "axon";
export const DendriteStructureName = "dendrite";
export const SomaStructureName = "soma";

const adjectiveMap = new Map<NeuronStructureKey, string>([[AxonStructureName, "axonal "], [DendriteStructureName, "dendritic "], [SomaStructureName, ""]]);

export function displayNeuronStructure(structure: NeuronStructureShape, isAdjective = false): string {
    if (isAdjective) {
        return (structure && adjectiveMap.has(structure.name)) ? adjectiveMap.get(structure.name) : "(none)";
    } else {
        return structure ? structure.name : "(none)";
    }
}
