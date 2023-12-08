export enum PredicateType {
    AnatomicalRegion = 1,
    CustomRegion = 2,
    IdOrDoi = 3
}

export enum PredicateTypeValue {
    AnatomicalRegion = "ANATOMICAL",
    CustomRegion = "CUSTOM",
    IdOrDoi = "ID",
}

export class BrainAreaFilterType {
    id: string;
    name: string;
    option: PredicateType;
    value: PredicateTypeValue;

    public constructor(id: string, name: string, option: PredicateType, value: PredicateTypeValue) {
        this.id = id;
        this.name = name;
        this.option = option;
        this.value = value;
    }

    public get IsCompartmentQuery(): boolean {
        return this.option === PredicateType.AnatomicalRegion;
    }

    public get IsCustomRegionQuery(): boolean {
        return this.option === PredicateType.CustomRegion;
    }

    public get IsIdQuery(): boolean {
        return this.option === PredicateType.IdOrDoi;
    }
}

export let BRAIN_AREA_FILTER_TYPE_COMPARTMENT: BrainAreaFilterType | null = null;
export let BRAIN_AREA_FILTER_TYPE_SPHERE: BrainAreaFilterType | null = null;
export let BRAIN_AREA_FILTER_TYPE_ID: BrainAreaFilterType | null = null;

const brainAreaFilterTypeLookup = new Map<number, BrainAreaFilterType>();

export const BRAIN_AREA_FILTER_TYPES: BrainAreaFilterType[] = makeBrainAreaFilterTypes();

export function findBrainAreaFilterType(option: PredicateType) {
    return brainAreaFilterTypeLookup.get(option);
}

function makeBrainAreaFilterTypes(): BrainAreaFilterType[] {

    const modes: BrainAreaFilterType[] = [];

    BRAIN_AREA_FILTER_TYPE_COMPARTMENT = new BrainAreaFilterType("c7c6a2c7-e92a-4c3b-8308-cef92114ecbb", "Anatomical Region", PredicateType.AnatomicalRegion, PredicateTypeValue.AnatomicalRegion);
    modes.push(BRAIN_AREA_FILTER_TYPE_COMPARTMENT);

    BRAIN_AREA_FILTER_TYPE_SPHERE = new BrainAreaFilterType("4780c646-f31b-42e6-bdf1-ff381b212e82", "Custom Region", PredicateType.CustomRegion, PredicateTypeValue.CustomRegion);
    modes.push(BRAIN_AREA_FILTER_TYPE_SPHERE);

    BRAIN_AREA_FILTER_TYPE_ID = new BrainAreaFilterType("10e81282-b7b9-4deF-b894-797e52780306", "Id or DOI", PredicateType.IdOrDoi, PredicateTypeValue.IdOrDoi);
    modes.push(BRAIN_AREA_FILTER_TYPE_ID);

    modes.map(m => {
        brainAreaFilterTypeLookup.set(m.option, m);
    });

    return modes;
}
