import {GenotypeShape} from "./genotype";
import {NeuronShape} from "./neuron";
import {InjectionShape} from "./injection";
import {CollectionShape} from "./collection";

export type TomographyRange = [number, number];

export type Tomography = {
    url: string;
    options: {
        range: TomographyRange;
        window: TomographyRange;
    }
}

export type SomaFeaturesShape = {
    defaultBrightness: number;
    defaultVolume: number;
}

export type SpecimenShape = {
    id: string,
    label: string;
    notes: string;
    referenceDate: Date;
    tomography?: Tomography;
    somaProperties?: SomaFeaturesShape;
    collection: CollectionShape;
    genotype: GenotypeShape;
    injections: InjectionShape[];
    neurons: NeuronShape[];
    neuronCount: number;
    createdAt: number;
    updatedAt: number;
}
