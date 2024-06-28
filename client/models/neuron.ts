import {displayBrainArea, IBrainArea} from "./brainArea";
import {isNullOrUndefined} from "../util/nodeUtil";
import {ISample} from "./sample";
import {IReconstruction} from "./reconstruction";
import {ConsensusStatus} from "./consensusStatus";
import {ITracing} from "./tracing";

export interface INeuron {
    id: string;
    idNumber: number;
    idString: string;
    tag: string;
    keywords: string;
    x: number;
    y: number;
    z: number;
    doi: string;
    consensus: ConsensusStatus;
    metadata?: string;
    sample: ISample;
    brainArea: IBrainArea;
    tracings?: ITracing[];
    reconstructions: IReconstruction[];
    createdAt: number;
    updatedAt: number;
}

export interface IParseSomaResult {
    x: number;
    y: number;
    z: number;
    error: string;
}

export interface IManualAnnotations {
    somaCompartmentId: number;
}

export interface IAnnotationMetadata {
    manualAnnotations: IManualAnnotations;
}

export interface IParsedAnnotationMetadata {
    somaCompartmentId: number;
}

export function displayNeuron(neuron: INeuron): string {
    return neuron?.idString ? neuron.idString : "(unnamed neuron)";
}

export function displayNeuronWithBrainStructure(neuron: INeuron): string {
    const name =  neuron?.idString ? neuron.idString : "(unnamed neuron)";

    if (!neuron) {
        return name;
    }

    const brainArea = displayBrainArea(neuron.brainArea || null);

    return `${name} (${brainArea})`;
}

export function formatSomaCoords(x: number, y: number, z: number) {
    const nx = !isNullOrUndefined(x) ? x.toFixed(1) : "n/a";
    const ny = !isNullOrUndefined(y) ? y.toFixed(1) : "n/a";
    const nz = !isNullOrUndefined(z) ? z.toFixed(1) : "n/a";

    return `(${nx}, ${ny}, ${nz})`;
}

export function formatSomaLocation(neuron: INeuron) {
    if (neuron) {
        return formatSomaCoords(neuron.x, neuron.y, neuron.z);
    } else {
        return "(n/a)";
    }
}

export function parseSomaLocation(location: string): IParseSomaResult {
    location = location.trim();

    if (location.length > 2 && location[0] === "(" && location[location.length - 1] === ")") {
        location = location.slice(1, location.length - 1).trim();
    }

    let parts = location.split(",");

    let somaParse = {
        x: NaN,
        y: NaN,
        z: NaN,
        error: ""
    };

    if (parts.length === 3) {
        somaParse.x = parseFloat(parts[0].trim());
        if (isNaN(somaParse.x)) {
            somaParse.error = "Can not parse soma x location";
            return somaParse;
        }

        somaParse.y = parseFloat(parts[1].trim());
        if (isNaN(somaParse.y)) {
            somaParse.error = "Can not parse soma y location";
            return somaParse;
        }

        somaParse.z = parseFloat(parts[2].trim());
        if (isNaN(somaParse.z)) {
            somaParse.error = "Can not parse soma z location";
            return somaParse;
        }
    } else {
        somaParse.error = "Can not parse soma location";
        return somaParse;
    }

    return somaParse;
}

export function parseNeuronAnnotationMetadata(neuron: INeuron): IParsedAnnotationMetadata {
    if (neuron?.metadata) {
        const data: IAnnotationMetadata = JSON.parse(neuron.metadata);

        if (data.manualAnnotations?.somaCompartmentId) {
            return {
                somaCompartmentId: data.manualAnnotations.somaCompartmentId
            };
        }
    }

    return null;
}

export function parseAnnotationMetadata(data: string): IParsedAnnotationMetadata {
    if (data && data.length > 0) {
        const metadata: IAnnotationMetadata = JSON.parse(data);

        if (metadata.manualAnnotations?.somaCompartmentId) {
            return {
                somaCompartmentId: metadata.manualAnnotations.somaCompartmentId
            };
        }
    }

    return null;
}

export function createNeuroglancerAnnotationLayer(neurons: INeuron[]) {
    /*
annotationProperties:[
        {
          "id": "color",
          "type": "rgb",
          "default": "#ff0000"
        },
        {
          "id": "size",
          "type": "float32",
          "default": 10
        }
        ]

        props: ["#00ff00", 5]
     */
    return neurons.map(n => {
        return {
            type: "point",
            id: n.id,
            point: [
                n.x / 10,
                n.y / 10,
                n.z / 10
            ]
        }
    });
}
