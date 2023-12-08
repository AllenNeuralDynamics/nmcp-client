import {displayTracingStructure, ITracingStructure} from "./tracingStructure";
import {displayStructureIdentifier, StructureIdentifier} from "./structureIdentifier";

// The subset of tracingStructure:structureIdentifier combinations used for search.  Is not a direct map of either, nor
// a full mux of both.
//
// To date, this particular choice of combinations is exclusively for presentation in this interface.
export class NeuronalStructure {
    private readonly _id: string;

    public structureIdentifier: ITracingStructure | null;
    public tracingStructure: ITracingStructure | null;

    public constructor(id: string, structureIdentifier: ITracingStructure | null, tracingStructure: ITracingStructure | null) {
        this._id = id;
        this.structureIdentifier = structureIdentifier;
        this.tracingStructure = tracingStructure;
    }

    public get id() {
        return this._id;
    }

    public get StructureIdentifierId() {
        return this.structureIdentifier ? this.structureIdentifier.id : null;
    }

    public get TracingStructureId() {
        return this.tracingStructure ? this.tracingStructure.id : null;
    }

    public get IsSoma() {
        return this.structureIdentifier && this.structureIdentifier.value === StructureIdentifier.soma;
    }

    public display(): string {
        let str = "";

        if (this.structureIdentifier) {
            str = displayStructureIdentifier(this.structureIdentifier);
        }

        if (this.tracingStructure) {
            str = displayTracingStructure(this.tracingStructure, str.length > 0) + str;
        }

        return str;
    }
}

export function displayNeuronalStructure(structure: NeuronalStructure): string {
    if (structure === null || structure === undefined) {
        return "(none)";
    }

    return structure.display();
}