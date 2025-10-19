import {AtlasStructureShape} from "./atlasStructure";
import {isNullOrUndefined} from "../util/nodeUtil";
import {SpecimenShape} from "./specimen";
import {Reconstruction} from "./reconstruction";
import {AtlasReconstruction} from "./atlasReconstruction";

export enum ExportFormat {
    SWC = 0,
    JSON = 1
}

export enum SomaPropertyOperator {
    None = 0,
    Equals = 1,
    LessThan = 2,
    GreaterThan = 3
}

export type SomaFilterProperties = {
    brightnessOperator?: SomaPropertyOperator;
    brightness?: number;
    volumeOperator?: SomaPropertyOperator;
    volume?: number;
}

export type SomaLocation = {
    x: number;
    y: number;
    z: number;
}

export type SomaProperties = {
    brightness?: number;
    volume?: number;
}

export type NeuronShape = {
    __typename?: string;
    id?: string;
    label?: string;
    keywords?: string[];
    specimenSoma?: SomaLocation;
    atlasSoma?: SomaLocation;
    specimen?: SpecimenShape;
    atlasStructureId?: string;
    atlasStructure?: AtlasStructureShape;
    somaProperties?: SomaProperties;
    reconstructions?: Reconstruction[];
    reconstructionCount?: number;
    published?: AtlasReconstruction;
    createdAt?: number;
    updatedAt?: number;
}

export interface IParseSomaResult {
    x: number;
    y: number;
    z: number;
    error: string;
}

export function formatNeuron(neuron: NeuronShape, placeholder: string = "(no label)"): string {
    return neuron?.label ? neuron.label : placeholder;
}

export function parseKeywords(value: string): string[] {
    return (value?.trim() ?? "").split(";").map(s => s.trim());
}

export function formatKeywords(keywords: string[]): string {
    return keywords.join(";");
}

export function formatSomaCoords(x: number, y: number, z: number) {
    const nx = !isNullOrUndefined(x) ? x.toFixed(1) : "n/a";
    const ny = !isNullOrUndefined(y) ? y.toFixed(1) : "n/a";
    const nz = !isNullOrUndefined(z) ? z.toFixed(1) : "n/a";

    return `(${nx}, ${ny}, ${nz})`;
}

export function formatSomaLocation(neuron: NeuronShape) {
    if (neuron) {
        return formatSomaCoords(neuron.atlasSoma?.x, neuron.atlasSoma?.y, neuron.atlasSoma?.z);
    } else {
        return "(n/a)";
    }
}

export function formatHortaLocation(neuron: NeuronShape) {
    if (neuron) {
        return formatSomaCoords(neuron.specimenSoma?.x, neuron.specimenSoma?.y, neuron.specimenSoma?.z);
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

export function createCandidateAnnotationLayer(neurons: NeuronShape[], selectedId: string) {
    const defaultColor = selectedId ? "#2184d033" : "#2184d0ff";
    const defaultSize = selectedId ? 3 : 5;

    return neurons.map(n => {
        return {
            type: "point",
            id: n.id,
            point: [
                (n.atlasSoma?.x || 0) / 10,
                (n.atlasSoma?.y || 0) / 10,
                (n.atlasSoma?.z || 0) / 10
            ],
            props: [n.id == selectedId ? "#00ff00ff" : defaultColor, n.id == selectedId ? 8 : defaultSize]
        }
    });
}
