import {formatAtlasStructure, AtlasStructureShape} from "./atlasStructure";
import {FluorophoreShape} from "./fluorophore";
import {InjectionVirusShape} from "./injectionVirus";
import {SpecimenShape} from "./specimen";

export type InjectionShape = {
    id: string;
    specimen: SpecimenShape;
    atlasStructure: AtlasStructureShape;
    injectionVirus: InjectionVirusShape;
    fluorophore: FluorophoreShape;
}

export function displayInjection(injection: InjectionShape, truncate: number = 0) {
    if (!injection) {
        return "(none)";
    }

    const str = formatAtlasStructure(injection.atlasStructure, "(missing atlas structure)");

    if (truncate > 0 && str.length > truncate + 3) {
        return str.substring(0, truncate) + "...";
    }

    return str;
}
