import {AtlasStructureShape} from "./atlasStructure";
import {isNullOrUndefined} from "../util/nodeUtil";
import {SpecimenShape} from "./specimen";
import {Reconstruction} from "./reconstruction";
import {AtlasReconstruction} from "./atlasReconstruction";

// Values are sent to the export service as raw numbers and must match its ExportFormat enum.
export enum ExportFormat {
    SWC = 100,
    Parquet = 400,
    legacyJSON = 900
}

// Values are sent to the export service as raw numbers and must match its ReconstructionSpace enum.
export enum ReconstructionSpace {
    Specimen = 100,
    Atlas = 200
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

// The API stores an unset soma as the origin rather than null, and its atlas-soma back-fill treats any component
// below 0.01 as unset, so match that rather than testing for null alone.
export function isSomaLocationSet(location: SomaLocation | null | undefined): boolean {
    return location != null && [location.x, location.y, location.z].every(v => Number.isFinite(v) && v >= 0.01);
}

// The neuron's own soma wins whenever it is set; the reconstruction's soma node is only a fallback.
export function selectSomaLocation(neuronSoma: SomaLocation | null | undefined, reconstructionSoma: SomaLocation | null | undefined): SomaLocation | null {
    if (isSomaLocationSet(neuronSoma)) {
        return neuronSoma;
    }

    return isSomaLocationSet(reconstructionSoma) ? reconstructionSoma : null;
}

export type SomaProperties = {
    brightness?: number;
    volume?: number;
}

export enum NeuronStatus {
    Unpublished = 100,
    Published = 200,
}

export type NeuronShape = {
    __typename?: string;
    id?: string;
    label?: string;
    keywords?: string[];
    specimenSoma?: SomaLocation;
    atlasSoma?: SomaLocation;
    specimen?: SpecimenShape;
    canonicalDoi?: string;
    atlasStructureId?: string;
    atlasStructure?: AtlasStructureShape;
    somaProperties?: SomaProperties;
    reconstructions?: Reconstruction[];
    reconstructionCount?: number;
    published?: AtlasReconstruction;
    untraceable?: boolean;
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
    return (value?.trim() ?? "").split(",").map(s => s.trim()).filter(s => s.length > 0);
}

export function formatKeywords(keywords: string[]): string {
    return (keywords ?? []).join(", ");
}

export enum BracesKind {
    None = 0,
    Paren = 1,
    Bracket = 2
}

export function bracesPair(braces: BracesKind): string[] {
    switch (braces) {
        case BracesKind.None:
            return ["", ""];
        case BracesKind.Paren:
            return ["(", ")"];
        case BracesKind.Bracket:
            return ["[", "]"];
        default:
            return ["", ""];
    }
}

export function formatSomaCoords(x: number, y: number, z: number, braces: BracesKind = BracesKind.Paren) {
    const nx = !isNullOrUndefined(x) ? x.toFixed(1) : "n/a";
    const ny = !isNullOrUndefined(y) ? y.toFixed(1) : "n/a";
    const nz = !isNullOrUndefined(z) ? z.toFixed(1) : "n/a";

    const bracesChar = bracesPair(braces);

    return `${bracesChar[0]}${nx}, ${ny}, ${nz}${bracesChar[1]}`;
}

export function formatSomaLocation(neuron: NeuronShape) {
    if (neuron) {
        return formatSomaCoords(neuron.atlasSoma?.x, neuron.atlasSoma?.y, neuron.atlasSoma?.z);
    } else {
        return "(n/a)";
    }
}

export function formatHortaLocation(neuron: NeuronShape, braces: BracesKind = BracesKind.Paren) {
    if (neuron) {
        return formatSomaCoords(neuron.specimenSoma?.x, neuron.specimenSoma?.y, neuron.specimenSoma?.z, braces);
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
