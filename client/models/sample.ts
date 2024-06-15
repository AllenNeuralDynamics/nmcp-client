import moment from "moment";

import {INeuron} from "./neuron";
import {IInjection} from "./injection";

import {displayMouseStrain, IMouseStrain} from "./mouseStrain";

export interface ISample {
    id: string,
    idNumber: number;
    animalId: string;
    tag: string;
    comment: string;
    sampleDate: Date;
    visibility: number;
    tomography: string;
    neuronCount: number;
    mouseStrain: IMouseStrain;
    injections: IInjection[];
    neurons: INeuron[];
    createdAt: number;
    updatedAt: number;
}

export function displaySample(sample: ISample) {
    if (!sample) {
        return "(none)";
    }

    return `${sample.animalId} (${moment(sample.sampleDate).format("YYYY-MM-DD")})`
}

export function displaySampleAnimal(sample: ISample) {
    const animal = (sample.animalId && sample.animalId.length > 0) ? sample.animalId : "(no animal id)";

    const strain = displayMouseStrain(sample.mouseStrain);

    return animal + "-" + strain;
}
