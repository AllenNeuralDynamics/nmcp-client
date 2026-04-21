import {makeObservable, observable} from "mobx";

import {findQueryPredicateKind, PredicateType, QUERY_PREDICATE_KIND_COMPARTMENT, QueryPredicateKind} from "./queryPredicateKind";
import {FilterContents, PredicateState, IPosition, IPositionInput} from "./filterContents";
import {DataConstants} from "../models/constants";
import {SearchPredicate} from "../models/searchPredicate";

export function arbNumberToString(isCustomRegion: boolean, valueStr: string): number {
    const value = valueStr.length === 0 ? 0 : parseFloat(valueStr);

    return !isCustomRegion || isNaN(value) ? null : value;
}

function createPositionInput(isCustomRegion: boolean, center: IPosition): IPositionInput {
    return {
        x: arbNumberToString(isCustomRegion, center.x),
        y: arbNumberToString(isCustomRegion, center.y),
        z: arbNumberToString(isCustomRegion, center.z),
    }
}

export type UIQueryPredicateState = {
    id: string;
    index: number;
    brainAreaFilterTypeOption: PredicateType;
    filter: PredicateState;
}

// This captures some additional information/behavior for the updated search API (from the previous FilterContents class).  Some refactoring would be useful
// to consolidate.
export class UIQueryPredicate {
    id: string = "";
    index: number = 0;
    brainAreaFilterType: QueryPredicateKind = QUERY_PREDICATE_KIND_COMPARTMENT;
    filter: FilterContents = null;

    public constructor() {
        makeObservable(this, {
            id: observable,
            index: observable,
            brainAreaFilterType: observable,
            filter: observable
        })
    }

    // Convert to the GraphQL representation of a predicate.
    public asSearchPredicate(): SearchPredicate {
        const predicate: SearchPredicate = {
            predicateType: this.brainAreaFilterType.value,
            composition: this.filter.composition
        };

        if (this.brainAreaFilterType.IsCompartmentQuery) {
            const amount = this.filter.amount.length === 0 ? 0 : parseFloat(this.filter.amount);
            const n = this.filter.neuronalStructure;
            const tracingStructureId = n ? n.TracingStructureId : null;
            const nodeStructureId = n ? n.StructureIdentifierId : null;
            const operatorId = n && n.IsSoma ? null : (this.filter.operator ? this.filter.operator.id : null);

            predicate.anatomicalPredicate = {
                neuronStructureId: tracingStructureId,
                nodeStructureId: n?.IsSoma ? null : nodeStructureId,
                operatorId,
                amount: isNaN(amount) ? null : amount,
                atlasStructureIds: this.filter.brainAreas.map(b => b.id)
            };
        } else if (this.brainAreaFilterType.IsCustomRegionQuery) {
            predicate.customRegionPredicate = {
                arbCenter: createPositionInput(true, this.filter.arbCenter),
                arbSize: arbNumberToString(true, this.filter.arbSize)
            };
        } else if (this.brainAreaFilterType.IsIdQuery) {
            predicate.idOrDoiPredicate = {
                labelsOrDois: this.filter.labelsOrDois.split(",").map(s => s.trim()).filter(s => s.length > 0),
                labelOrDoiExactMatch: this.filter.tracingIdsOrDOIsExactMatch
            };
        }

        return predicate;
    }

    // Serialize for local browser storage or URL sharing.
    public serialize(): UIQueryPredicateState {
        return {
            id: this.id,
            index: this.index,
            brainAreaFilterTypeOption: this.brainAreaFilterType.option,
            filter: this.filter ? this.filter.serialize() : null
        }
    }

    // Deserialize for local browser storage or URL sharing.
    public static deserialize(data: UIQueryPredicateState, constants: DataConstants): UIQueryPredicate {
        const filter = new UIQueryPredicate();

        filter.id = data.id || "";
        filter.index = data.index || 0;
        filter.brainAreaFilterType = findQueryPredicateKind(data.brainAreaFilterTypeOption || PredicateType.AnatomicalRegion);
        filter.filter = data.filter ? FilterContents.deserialize(data.filter, constants) : null;

        return filter;
    }
}
