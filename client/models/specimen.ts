import {GenotypeShape} from "./genotype";
import {NeuronShape} from "./neuron";
import {InjectionShape} from "./injection";

export type SpecimenShape = {
    id: string,
    label: string;
    notes: string;
    referenceDate: Date;
    tomographyUrl: string;
    neuronCount: number;
    genotype: GenotypeShape;
    injections: InjectionShape[];
    neurons: NeuronShape[];
    collectionId: string;
    createdAt: number;
    updatedAt: number;
}
