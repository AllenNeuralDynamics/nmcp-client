import {GenotypeShape} from "./genotype";
import {NeuronShape} from "./neuron";
import {InjectionShape} from "./injection";

export type SomaFeaturesShape = {
    defaultBrightness: number;
    defaultVolume: number;
}

export type SpecimenShape = {
    id: string,
    label: string;
    notes: string;
    referenceDate: Date;
    tomographyUrl: string;
    neuronCount: number;
    somaProperties?: SomaFeaturesShape;
    genotype: GenotypeShape;
    injections: InjectionShape[];
    neurons: NeuronShape[];
    collectionId: string;
    createdAt: number;
    updatedAt: number;
}
