import {displayNeuronStructure, NeuronStructureShape} from "./neuronStructure";
import {displayStructureIdentifier, NodeStructureKind, NodeStructureShape} from "./structureIdentifier";

// The subset of tracingStructure:structureIdentifier combinations used for search.  Is not a direct map of either, nor
// a full mux of both.
//
// To date, this particular choice of combinations is exclusively for presentation in this interface.
export class NeuronalStructure {
    private readonly _id: string;

    public structureIdentifier: NodeStructureShape | null;
    public tracingStructure: NeuronStructureShape | null;

    public constructor(id: string, structureIdentifier: NodeStructureShape | null, tracingStructure: NeuronStructureShape | null) {
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
        return this.structureIdentifier && this.structureIdentifier.swcValue === NodeStructureKind.soma;
    }

    public display(): string {
        let str = "";

        if (this.structureIdentifier) {
            str = displayStructureIdentifier(this.structureIdentifier);
        }

        if (this.tracingStructure && this.structureIdentifier?.swcValue !== NodeStructureKind.soma) {
            str = displayNeuronStructure(this.tracingStructure, false) + " " + str;
        }

        return str;
    }

    public predicateName(): string {
        if (this.IsSoma) {
            return "soma";
        }

        if (!this.structureIdentifier) {
            return this.tracingStructure ? displayNeuronStructure(this.tracingStructure, false) + " length" : "(none)";
        }

        if (this.structureIdentifier.swcValue === NodeStructureKind.soma) {
            return this.display();
        }

        return this.display() + "s";
    }
}
