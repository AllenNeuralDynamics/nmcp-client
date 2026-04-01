import {GenotypeShape} from "./genotype";
import {NeuronShape} from "./neuron";
import {InjectionShape} from "./injection";
import {CollectionShape} from "./collection";

export type TomographyRange = [number, number];

export type LinearTransformVector = {
    x: number;
    y: number;
    z: number;
}

export type LinearTransform = {
    scale: LinearTransformVector;
    translate: LinearTransformVector;
}

export type Tomography = {
    url: string;
    options: {
        range: TomographyRange;
        window: TomographyRange;
    };
    linearTransform?: LinearTransform;
}

export type ReferenceDataset = {
    url: string;
    segmentationUrl: string;
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
    referenceDataset?: ReferenceDataset;
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
