import * as React from "react";
import {Form, Grid, Icon, Input} from "semantic-ui-react";

import {IBrainArea} from "../../models/brainArea";

import {BrainAreaMultiSelect} from "../editors/BrainAreaMultiSelect";
import {IQueryOperator} from "../../models/queryOperator";
import {QueryOperatorSelect} from "./editors/QueryOperatorSelect";
import {FilterComposition} from "../../models/queryFilter";
import {NeuronalStructure} from "../../models/neuronalStructure";
import {NeuronalStructureSelect} from "./editors/NeuronalStructureSelect";
import {NdbConstants} from "../../models/constants";
import {BrainAreaFilterTypeSelect} from "./editors/BrainAreaFilterTypeSelect";
import {
    BRAIN_AREA_FILTER_TYPES, BrainAreaFilterType,
    PredicateType
} from "../../models/brainAreaFilterType";
import {CompositionSelect} from "./editors/CompositionSelect";
import {UIQueryPredicate} from "../../models/uiQueryPredicate";

interface IQueryFilterProps {
    constants: NdbConstants;
    isRemovable: boolean;
    isComposite: boolean;
    queryFilter: UIQueryPredicate;
    queryOperators: IQueryOperator[];

    onChangeFilter?(filter: UIQueryPredicate): void;
    onRemoveFilter?(id: string): void;
}

export type compositionOption = {
    label: string;
    value: FilterComposition;
}

const compositionOptions: compositionOption[] = [
    {label: "and", value: FilterComposition.and},
    {label: "or", value: FilterComposition.or},
    {label: "not", value: FilterComposition.not}
];

const compositionOptionMap = new Map<FilterComposition, compositionOption>();
compositionOptions.map(c => compositionOptionMap.set(c.value, c));


export function QueryFilter(props: IQueryFilterProps) {
    const onCompositionChange = (option: any) => {
        const filter = props.queryFilter;
        filter.filter.composition = option.value as number;
        props.onChangeFilter?.(filter);
    };

    const onQueryOperatorChange = (operator: IQueryOperator) => {
        const filter = props.queryFilter;
        filter.filter.operator = operator;
        props.onChangeFilter?.(filter);
    };

    const onAmountChange = (evt: any) => {
        const filter = props.queryFilter;
        filter.filter.amount = evt.target.value;
        props.onChangeFilter?.(filter);
    };

    const onArbCenterChanged = (evt: any, which: string) => {
        const filter = props.queryFilter;
        filter.filter.arbCenter[which] = evt.target.value;
        props.onChangeFilter?.(filter);
    };

    const onArbSizeChanged = (evt: any) => {
        const filter = props.queryFilter;
        filter.filter.arbSize = evt.target.value;
        props.onChangeFilter?.(filter);
    };

    const onQueryTracingIdChanged = (evt: any) => {
        const filter = props.queryFilter;
        filter.filter.tracingIdsOrDOIs = evt.target.value;
        props.onChangeFilter?.(filter);
    };

    const onBrainAreaChange = (brainAreas: IBrainArea[]) => {
        const filter = props.queryFilter;
        filter.filter.brainAreas = brainAreas;
        props.onChangeFilter?.(filter);
    };

    const onBrainAreaFilterTypeChanged = (b: BrainAreaFilterType) => {
        const filter = props.queryFilter;
        filter.brainAreaFilterType = b;
        props.onChangeFilter?.(filter);
    };

    const onNeuronalStructureChange = (neuronalStructures: NeuronalStructure) => {
        const filter = props.queryFilter;
        filter.filter.neuronalStructure = neuronalStructures;
        props.onChangeFilter?.(filter);
    };

    const onTracingIdsOrDOIsExactMatch = () => {
        const filter = props.queryFilter;
        filter.filter.tracingIdsOrDOIsExactMatch = !filter.filter.tracingIdsOrDOIsExactMatch;
        props.onChangeFilter?.(filter);
    };

    const onFilterBrainArea = (option: any, filterValue: string) => {
        if (!filterValue) {
            return true;
        }

        const labelTest = (option["label"] as string).toLowerCase();

        if (labelTest.indexOf(filterValue) >= 0) {
            return true;
        }

        if (option.value.acronym.toLowerCase().includes(filterValue)) {
            return true;
        }

        const matches = option.value.aliases.some(a => a.toLowerCase().includes(filterValue));

        if (matches) {
            return true;
        }

        const parts = filterValue.split(/\s+/);

        if (parts.length < 2) {
            return false;
        }

        const itemParts = labelTest.split(/\s+/);

        return parts.some(p => {
            return itemParts.some(i => i === p);
        });
    };

    const renderComposition = () => {
        if (props.isComposite) {
            return <CompositionSelect idName="composition-select" options={compositionOptions}
                                      multiSelect={false} searchable={false}
                                      selectedOption={compositionOptionMap.get(props.queryFilter.filter.composition)}
                                      onSelect={(option: any) => onCompositionChange(option)}/>
        } else {
            return null;
        }
    };

    const renderRemoveElement = () => {
        if (props.isRemovable) {
            return (
                <div style={{marginTop: "18px"}}>
                    <Icon name="remove" onClick={() => props.onRemoveFilter?.(props.queryFilter.id)}/>
                </div>
            )
        } else {
            return null;
        }
    };

    const renderSphereQuery = () => {
        return (
            <Grid.Row style={{padding: "30px 0px 20px 10px", margin: 0}}>
                <Grid.Column width={16}>
                    <Form size="small">
                        <Form.Group>
                            <Form.Field width={3}>
                                <label>Query Type</label>
                                <BrainAreaFilterTypeSelect idName="filter-mode"
                                                           options={BRAIN_AREA_FILTER_TYPES}
                                                           placeholder="required"
                                                           clearable={false}
                                                           searchable={false}
                                                           selectedOption={props.queryFilter.brainAreaFilterType}
                                                           onSelect={(v: BrainAreaFilterType) => onBrainAreaFilterTypeChanged(v)}/>
                            </Form.Field>

                            <Form.Field width={2}>
                                <label>X (µm)</label>
                                <Input placeholder="" value={props.queryFilter.filter.arbCenter.x}
                                       style={{maxHeight: "34px"}}
                                       onChange={(evt: any) => onArbCenterChanged(evt, "x")}/>
                            </Form.Field>

                            <Form.Field width={2}>
                                <label>Y (µm)</label>
                                <Input placeholder="" value={props.queryFilter.filter.arbCenter.y}
                                       style={{maxHeight: "34px"}}
                                       onChange={(evt: any) => onArbCenterChanged(evt, "y")}/>
                            </Form.Field>

                            <Form.Field width={2}>
                                <label>Z (µm)</label>
                                <Input placeholder="" value={props.queryFilter.filter.arbCenter.z}
                                       style={{maxHeight: "34px"}}
                                       onChange={(evt: any) => onArbCenterChanged(evt, "z")}/>
                            </Form.Field>

                            <Form.Field width={2}>
                                <label>Radius (µm)</label>
                                <Input placeholder="" value={props.queryFilter.filter.arbSize}
                                       style={{maxHeight: "34px"}}
                                       onChange={(evt: any) => onArbSizeChanged(evt)}/>
                            </Form.Field>

                            <Form.Field width={2}>
                                <label>Structure</label>
                                <NeuronalStructureSelect idName="neuronal-structure"
                                                         options={props.constants.NeuronStructures}
                                                         selectedOption={props.queryFilter.filter.neuronalStructure}
                                                         multiSelect={false}
                                                         searchable={false}
                                                         placeholder="any"
                                                         onSelect={(ns: NeuronalStructure) => onNeuronalStructureChange(ns)}/>
                            </Form.Field>

                            <Form.Field width={2}
                                        style={{visibility: props.queryFilter.filter.CanHaveThreshold ? "visible" : "hidden"}}>
                                <label>Threshold</label>
                                <QueryOperatorSelect idName="query-operator"
                                                     options={props.queryOperators}
                                                     selectedOption={props.queryFilter.filter.operator}
                                                     disabled={!props.queryFilter.filter.CanHaveThreshold}
                                                     searchable={false}
                                                     clearable={true}
                                                     placeholder="any"
                                                     onSelect={(operator: IQueryOperator) => onQueryOperatorChange(operator)}/>
                            </Form.Field>

                            {props.queryFilter.filter.operator != null ?
                                <Form.Field width={1} error={!props.queryFilter.filter.IsAmountValid}
                                            style={{visibility: props.queryFilter.filter.CanHaveThreshold ? "visible" : "hidden"}}>
                                    <label>&nbsp;</label>
                                    <Input placeholder="" disabled={!props.queryFilter.filter.CanHaveThreshold}
                                           value={props.queryFilter.filter.amount} style={{maxHeight: "34px"}}
                                           onChange={(evt: any) => onAmountChange(evt)}/>
                                </Form.Field>
                                : null}
                        </Form.Group>
                    </Form>
                </Grid.Column>
            </Grid.Row>
        );
    };

    const renderByIdQuery = () => {
        return (
            <Grid.Row style={{padding: "30px 0px 20px 10px", margin: 0}}>
                <Grid.Column width={16}>
                    <Form size="small">
                        <Form.Group>
                            <Form.Field width={3}>
                                <label>Query Type</label>
                                <BrainAreaFilterTypeSelect idName="filter-mode"
                                                           options={BRAIN_AREA_FILTER_TYPES}
                                                           placeholder="required"
                                                           clearable={false}
                                                           searchable={false}
                                                           selectedOption={props.queryFilter.brainAreaFilterType}
                                                           onSelect={(v: BrainAreaFilterType) => onBrainAreaFilterTypeChanged(v)}/>
                            </Form.Field>

                            <Form.Field width={11}>
                                <label>Id or DOI (use comma-separated list for multiple)</label>
                                <Input placeholder="" value={props.queryFilter.filter.tracingIdsOrDOIs}
                                       style={{maxHeight: "34px"}}
                                       onChange={(evt: any) => onQueryTracingIdChanged(evt)}/>
                            </Form.Field>
                            <Form.Field width={2}>
                                <label>&nbsp;</label>
                                <div style={{margin: "12px 0"}}>
                                    <Form.Checkbox label="Exact match"
                                                   checked={props.queryFilter.filter.tracingIdsOrDOIsExactMatch}
                                                   onChange={() => onTracingIdsOrDOIsExactMatch()}/>
                                </div>
                            </Form.Field>
                        </Form.Group>
                    </Form>
                </Grid.Column>
            </Grid.Row>
        );
    };

    const renderCompartmentQuery = () => {
        const filter = props.queryFilter.filter;

        return (
            <Grid.Row style={{padding: "30px 0px 20px 10px", margin: 0}}>
                <Grid.Column width={16}>
                    <Form size="small">
                        <Form.Group>
                            <Form.Field width={3}>
                                <label>Query Type</label>
                                <BrainAreaFilterTypeSelect idName="filter-mode"
                                                           options={BRAIN_AREA_FILTER_TYPES}
                                                           placeholder="required"
                                                           clearable={false}
                                                           searchable={false}
                                                           selectedOption={props.queryFilter.brainAreaFilterType}
                                                           onSelect={(v: BrainAreaFilterType) => onBrainAreaFilterTypeChanged(v)}/>
                            </Form.Field>


                            <Form.Field width={7}>
                                <label>Source or Target Locations (multiple treated as or condition)</label>
                                <BrainAreaMultiSelect compartments={props.constants.BrainAreasWithGeometry}
                                                      selection={filter.brainAreas}
                                                      onSelectionChange={(brainAreas: IBrainArea[]) => onBrainAreaChange(brainAreas)}/>
                            </Form.Field>

                            <Form.Field width={3}>
                                <label>Structure</label>
                                <NeuronalStructureSelect idName="neuronal-structure"
                                                         options={props.constants.NeuronStructures}
                                                         selectedOption={filter.neuronalStructure}
                                                         multiSelect={false}
                                                         searchable={false}
                                                         clearable={true}
                                                         placeholder="any"
                                                         onSelect={(ns: NeuronalStructure) => onNeuronalStructureChange(ns)}/>
                            </Form.Field>

                            <Form.Field width={2} style={{visibility: filter.CanHaveThreshold ? "visible" : "hidden"}}>
                                <label>Threshold</label>
                                <QueryOperatorSelect idName="query-operator"
                                                     options={props.queryOperators}
                                                     selectedOption={filter.operator}
                                                     disabled={!filter.CanHaveThreshold}
                                                     searchable={false}
                                                     clearable={true}
                                                     placeholder="any"
                                                     onSelect={(operator: IQueryOperator) => onQueryOperatorChange(operator)}/>
                            </Form.Field>

                            {props.queryFilter.filter.operator != null ?
                                <Form.Field width={1} error={!filter.IsAmountValid}
                                            style={{visibility: filter.CanHaveThreshold ? "visible" : "hidden"}}>
                                    <label>&nbsp;</label>
                                    <Input placeholder="" disabled={!filter.CanHaveThreshold}
                                           value={props.queryFilter.filter.amount} style={{maxHeight: "34px"}}
                                           onChange={(evt: any) => onAmountChange(evt)}/>
                                </Form.Field>
                                : null}
                        </Form.Group>
                    </Form>
                </Grid.Column>
            </Grid.Row>
        );
    };

    const chooseFilterRender = () => {
        switch (props.queryFilter.brainAreaFilterType.option) {
            case PredicateType.AnatomicalRegion:
                return renderCompartmentQuery();
            case PredicateType.CustomRegion:
                return renderSphereQuery();
            case PredicateType.IdOrDoi:
                return renderByIdQuery();
            default:
                return null;
        }
    };

    const isCompartment = props.queryFilter.brainAreaFilterType.IsCompartmentQuery;

    return (
        <div style={Object.assign({}, listItemStyle, isCompartment ? compartmentItemStyle : sphereItemStyle)}>
            <div style={{
                width: "90px",
                order: 0,
                flexBasis: "content",
                marginTop: "36px",
                paddingLeft: "8px"
            }}>
                {renderComposition()}
            </div>
            <Grid style={{flexGrow: 1, order: 1}}>
                {chooseFilterRender()}
            </Grid>
            <div style={{
                minWidth: "40px",
                width: "40px",
                order: 2,
                verticalAlign: "middle",
                margin: "auto",
                textAlign: "center"
            }}>
                {renderRemoveElement()}
            </div>
        </div>
    );
}

const listItemStyle: any = {
    backgroundColor: "white",
    display: "flex",
    flexDirection: "row",
    marginBottom: "10px",
};

const compartmentItemStyle: any = {
    border: "1px solid rgb(138,195,65)",
    borderTop: "4px solid rgb(138,195,65)"
};

const sphereItemStyle: any = {
    border: "1px solid rgb(63,194,205)",
    borderTop: "4px solid rgb(63,194,205)"
};


/* TODO Sort is not available in react-select v2
private onFilterBrainAreas(options: object[], filterValue: string, currentValues: any[]) {
    filterValue = filterValue.toLowerCase();

    const currentStringValues: string[] = currentValues ? currentValues.map((i: any) => i["value"]) : [];

    //if (currentValues) currentValues = currentValues.map((i: any) => i["value"]);

    const optionsInList = options.filter((option: any) => {
        if (currentStringValues.indexOf(option["value"]) > -1) {
            return false;
        }

        return this.onFilterBrainArea(option, filterValue);
    });

    return optionsInList.sort((a, b) => {
        const labelA = (a["label"] as string).toLowerCase();
        const labelB = (b["label"] as string).toLowerCase();

        if (labelA === filterValue) {
            return -1;
        }

        if (labelB === filterValue) {
            return 1;
        }

        const parts = filterValue.split(/\s+/);

        const partsA = labelA.split(/\s+/);
        const partsB = labelB.split(/\s+/);

        const areaA = this.lookupBrainArea(a["value"] as string);
        const areaB = this.lookupBrainArea(b["value"] as string);

        if (partsA.length > 1 && partsB.length > 1) {
            const countA = partsA.reduce((p, c) => {
                return parts.some(p => p === c) ? p + 1 : p;
            }, 0);

            const countB = partsB.reduce((p, c) => {
                return parts.some(p => p === c) ? p + 1 : p;
            }, 0);

            if (countA > 0 || countB > 0) {
                if (countA === countB) {
                    return areaA.structureIdPath.split("/").length - areaB.structureIdPath.split("/").length;
                } else {
                    return countB - countA;
                }
            }
        }

        return areaA.structureIdPath.split("/").length - areaB.structureIdPath.split("/").length;
    });
}

private lookupBrainArea(id: string | number) {
    return this.props.constants.findBrainArea(id);
}
*/
