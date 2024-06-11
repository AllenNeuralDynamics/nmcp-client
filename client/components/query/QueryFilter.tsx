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


export class QueryFilter extends React.Component<IQueryFilterProps, {}> {
    public constructor(props: IQueryFilterProps) {
        super(props);
    }

    private onCompositionChange(option: any) {
        this.setState({selectedComposition: option});

        const filter = this.props.queryFilter;
        filter.filter.composition = option.value as number;
        this.props.onChangeFilter(filter);
    }

    private onQueryOperatorChange(operator: IQueryOperator) {
        const filter = this.props.queryFilter;
        filter.filter.operator = operator;
        this.props.onChangeFilter(filter);
    }

    private onAmountChange(evt: any) {
        const filter = this.props.queryFilter;
        filter.filter.amount = evt.target.value;
        this.props.onChangeFilter(filter);
    }

    private onArbCenterChanged(evt: any, which: string) {
        const filter = this.props.queryFilter;
        filter.filter.arbCenter[which] = evt.target.value;
        this.props.onChangeFilter(filter);
    }

    private onArbSizeChanged(evt: any) {
        const filter = this.props.queryFilter;
        filter.filter.arbSize = evt.target.value;
        this.props.onChangeFilter(filter);
    }

    private onQueryTracingIdChanged(evt: any) {
        const filter = this.props.queryFilter;
        filter.filter.tracingIdsOrDOIs = evt.target.value;
        this.props.onChangeFilter(filter);
    }

    private onBrainAreaChange(brainAreas: IBrainArea[]) {
        const filter = this.props.queryFilter;
        filter.filter.brainAreas = brainAreas;
        this.props.onChangeFilter(filter);
    }

    private onBrainAreaFilterTypeChanged(b: BrainAreaFilterType) {
        const filter = this.props.queryFilter;
        filter.brainAreaFilterType = b;
        this.props.onChangeFilter(filter);
    }

    private onNeuronalStructureChange(neuronalStructures: NeuronalStructure) {
        const filter = this.props.queryFilter;
        filter.filter.neuronalStructure = neuronalStructures;
        this.props.onChangeFilter(filter);
    }


    private onTracingIdsOrDOIsExactMatch() {
        const filter = this.props.queryFilter;
        filter.filter.tracingIdsOrDOIsExactMatch = !filter.filter.tracingIdsOrDOIsExactMatch;
        this.props.onChangeFilter(filter);
    }

    private onFilterBrainArea(option: any, filterValue: string) {
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
    }

    private renderComposition() {
        if (this.props.isComposite) {
            return <CompositionSelect idName="composition-select" options={compositionOptions}
                                      multiSelect={false} searchable={false}
                                      selectedOption={compositionOptionMap.get(this.props.queryFilter.filter.composition)}
                                      onSelect={(option: any) => this.onCompositionChange(option)}/>
        } else {
            return null;
        }
    }

    private renderRemoveElement() {
        if (this.props.isRemovable) {
            return (
                <div style={{marginTop: "18px"}}>
                    <Icon name="remove" onClick={() => this.props.onRemoveFilter(this.props.queryFilter.id)}/>
                </div>
            )
        } else {
            return null;
        }
    }

    private renderSphereQuery() {
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
                                                           selectedOption={this.props.queryFilter.brainAreaFilterType}
                                                           onSelect={(v: BrainAreaFilterType) => this.onBrainAreaFilterTypeChanged(v)}/>
                            </Form.Field>

                            <Form.Field width={2}>
                                <label>X (µm)</label>
                                <Input placeholder="" value={this.props.queryFilter.filter.arbCenter.x}
                                       style={{maxHeight: "34px"}}
                                       onChange={(evt: any) => this.onArbCenterChanged(evt, "x")}/>
                            </Form.Field>

                            <Form.Field width={2}>
                                <label>Y (µm)</label>
                                <Input placeholder="" value={this.props.queryFilter.filter.arbCenter.y}
                                       style={{maxHeight: "34px"}}
                                       onChange={(evt: any) => this.onArbCenterChanged(evt, "y")}/>
                            </Form.Field>

                            <Form.Field width={2}>
                                <label>Z (µm)</label>
                                <Input placeholder="" value={this.props.queryFilter.filter.arbCenter.z}
                                       style={{maxHeight: "34px"}}
                                       onChange={(evt: any) => this.onArbCenterChanged(evt, "z")}/>
                            </Form.Field>

                            <Form.Field width={2}>
                                <label>Radius (µm)</label>
                                <Input placeholder="" value={this.props.queryFilter.filter.arbSize}
                                       style={{maxHeight: "34px"}}
                                       onChange={(evt: any) => this.onArbSizeChanged(evt)}/>
                            </Form.Field>

                            <Form.Field width={2}>
                                <label>Structure</label>
                                <NeuronalStructureSelect idName="neuronal-structure"
                                                         options={this.props.constants.NeuronStructures}
                                                         selectedOption={this.props.queryFilter.filter.neuronalStructure}
                                                         multiSelect={false}
                                                         searchable={false}
                                                         placeholder="any"
                                                         onSelect={(ns: NeuronalStructure) => this.onNeuronalStructureChange(ns)}/>
                            </Form.Field>

                            <Form.Field width={2}
                                        style={{visibility: this.props.queryFilter.filter.CanHaveThreshold ? "visible" : "hidden"}}>
                                <label>Threshold</label>
                                <QueryOperatorSelect idName="query-operator"
                                                     options={this.props.queryOperators}
                                                     selectedOption={this.props.queryFilter.filter.operator}
                                                     disabled={!this.props.queryFilter.filter.CanHaveThreshold}
                                                     searchable={false}
                                                     clearable={true}
                                                     placeholder="any"
                                                     onSelect={(operator: IQueryOperator) => this.onQueryOperatorChange(operator)}/>
                            </Form.Field>

                            {this.props.queryFilter.filter.operator != null ?
                                <Form.Field width={1} error={!this.props.queryFilter.filter.IsAmountValid}
                                            style={{visibility: this.props.queryFilter.filter.CanHaveThreshold ? "visible" : "hidden"}}>
                                    <label>&nbsp;</label>
                                    <Input placeholder="" disabled={!this.props.queryFilter.filter.CanHaveThreshold}
                                           value={this.props.queryFilter.filter.amount} style={{maxHeight: "34px"}}
                                           onChange={(evt: any) => this.onAmountChange(evt)}/>
                                </Form.Field>
                                : null}
                        </Form.Group>
                    </Form>
                </Grid.Column>
            </Grid.Row>
        );
    }

    private renderByIdQuery() {
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
                                                           selectedOption={this.props.queryFilter.brainAreaFilterType}
                                                           onSelect={(v: BrainAreaFilterType) => this.onBrainAreaFilterTypeChanged(v)}/>
                            </Form.Field>

                            <Form.Field width={11}>
                                <label>Id or DOI (use comma-separated list for multiple)</label>
                                <Input placeholder="" value={this.props.queryFilter.filter.tracingIdsOrDOIs}
                                       style={{maxHeight: "34px"}}
                                       onChange={(evt: any) => this.onQueryTracingIdChanged(evt)}/>
                            </Form.Field>
                            <Form.Field width={2}>
                                <label>&nbsp;</label>
                                <div style={{margin: "12px 0"}}>
                                    <Form.Checkbox label="Exact match"
                                                   checked={this.props.queryFilter.filter.tracingIdsOrDOIsExactMatch}
                                                   onChange={() => this.onTracingIdsOrDOIsExactMatch()}/>
                                </div>
                            </Form.Field>
                        </Form.Group>
                    </Form>
                </Grid.Column>
            </Grid.Row>
        );
    }

    private renderCompartmentQuery() {
        const filter = this.props.queryFilter.filter;

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
                                                           selectedOption={this.props.queryFilter.brainAreaFilterType}
                                                           onSelect={(v: BrainAreaFilterType) => this.onBrainAreaFilterTypeChanged(v)}/>
                            </Form.Field>


                            <Form.Field width={7}>
                                <label>Source or Target Locations (multiple treated as or condition)</label>
                                <BrainAreaMultiSelect compartments={this.props.constants.BrainAreasWithGeometry}
                                                      selection={filter.brainAreas}
                                                      onSelectionChange={(brainAreas: IBrainArea[]) => this.onBrainAreaChange(brainAreas)}/>
                            </Form.Field>

                            <Form.Field width={3}>
                                <label>Structure</label>
                                <NeuronalStructureSelect idName="neuronal-structure"
                                                         options={this.props.constants.NeuronStructures}
                                                         selectedOption={filter.neuronalStructure}
                                                         multiSelect={false}
                                                         searchable={false}
                                                         clearable={true}
                                                         placeholder="any"
                                                         onSelect={(ns: NeuronalStructure) => this.onNeuronalStructureChange(ns)}/>
                            </Form.Field>

                            <Form.Field width={2} style={{visibility: filter.CanHaveThreshold ? "visible" : "hidden"}}>
                                <label>Threshold</label>
                                <QueryOperatorSelect idName="query-operator"
                                                     options={this.props.queryOperators}
                                                     selectedOption={filter.operator}
                                                     disabled={!filter.CanHaveThreshold}
                                                     searchable={false}
                                                     clearable={true}
                                                     placeholder="any"
                                                     onSelect={(operator: IQueryOperator) => this.onQueryOperatorChange(operator)}/>
                            </Form.Field>

                            {this.props.queryFilter.filter.operator != null ?
                                <Form.Field width={1} error={!filter.IsAmountValid}
                                            style={{visibility: filter.CanHaveThreshold ? "visible" : "hidden"}}>
                                    <label>&nbsp;</label>
                                    <Input placeholder="" disabled={!filter.CanHaveThreshold}
                                           value={this.props.queryFilter.filter.amount} style={{maxHeight: "34px"}}
                                           onChange={(evt: any) => this.onAmountChange(evt)}/>
                                </Form.Field>
                                : null}
                        </Form.Group>
                    </Form>
                </Grid.Column>
            </Grid.Row>
        );
    }

    private chooseFilterRender() {
        switch (this.props.queryFilter.brainAreaFilterType.option) {
            case PredicateType.AnatomicalRegion:
                return this.renderCompartmentQuery();
            case PredicateType.CustomRegion:
                return this.renderSphereQuery();
            case PredicateType.IdOrDoi:
                return this.renderByIdQuery();
            default:
                return null;
        }
    }

    public render() {
        const isCompartment = this.props.queryFilter.brainAreaFilterType.IsCompartmentQuery;

        return (
            <div style={Object.assign({}, listItemStyle, isCompartment ? compartmentItemStyle : sphereItemStyle)}>
                <div style={{
                    width: "90px",
                    order: 0,
                    flexBasis: "content",
                    marginTop: "36px",
                    paddingLeft: "8px"
                }}>
                    {this.renderComposition()}
                </div>
                <Grid style={{flexGrow: 1, order: 1}}>
                    {this.chooseFilterRender()}
                </Grid>
                <div style={{
                    minWidth: "40px",
                    width: "40px",
                    order: 2,
                    verticalAlign: "middle",
                    margin: "auto",
                    textAlign: "center"
                }}>
                    {this.renderRemoveElement()}
                </div>
            </div>
        );
    }
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
