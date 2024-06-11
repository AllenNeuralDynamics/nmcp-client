import {displayBrainArea, IBrainArea} from "./brainArea";
import {IFluorophore} from "./fluorophore";
import {IInjectionVirus} from "./injectionVirus";
import {ISample} from "./sample";

export interface IInjection {
    id: string;
    brainArea: IBrainArea;
    injectionVirus: IInjectionVirus;
    fluorophore: IFluorophore;
    sample: ISample;
}

export function displayInjection(injection: IInjection, truncate: number = 0) {
    if (!injection) {
        return "(none)";
    }

    const str = displayBrainArea(injection.brainArea, "(no brain area)");

    if (truncate > 0 && str.length > truncate + 3) {
        return str.substring(0, truncate) + "...";
    }

    return str;
}

export function displayInjections(injections: IInjection[], missing: string = "(none)") {
    if (!injections || injections.length === 0) {
        return missing;
    }

    return injections.reduce((prev, curr) => prev + `${displayInjection(curr)}, `, "").slice(0, -2);
}
