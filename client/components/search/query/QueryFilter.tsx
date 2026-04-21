import * as React from "react";
import {observer} from "mobx-react-lite";
import {ActionIcon, Checkbox, Flex, Select, Text, TextInput} from "@mantine/core";
import {IconX} from "@tabler/icons-react";

import {useConstants} from "../../../hooks/useConstants";
import {AtlasStructureShape} from "../../../models/atlasStructure";
import {NeuronalStructure} from "../../../models/neuronalStructure";
import {IQueryOperator} from "../../../models/queryOperator";
import {PredicateComposition, PredicateCompositions} from "../../../viewmodel/filterContents";
import {
    QUERY_PREDICATE_KINDS, QueryPredicateKind, PredicateType
} from "../../../viewmodel/queryPredicateKind";
import {UIQueryPredicate} from "../../../viewmodel/uiQueryPredicate";
import {AtlasStructureMultiSelect} from "../../common/AtlasStructureMultiSelect";

const queryPredicateLookup = new Map<string, QueryPredicateKind>();

const queryPredicateOptions = QUERY_PREDICATE_KINDS.map(q => {
    queryPredicateLookup.set(q.id, q);
    return {label: q.name, value: q.id}
});

const nodeStructureLookup = new Map<string, NeuronalStructure>();
let nodeStructureOptions = [];

const queryOperatorLookup = new Map<string, IQueryOperator>();
let queryOperatorOptions = [];

interface IQueryFilterProps {
    isRemovable: boolean;
    isSolo: boolean;
    isComposite: boolean;
    queryFilter: UIQueryPredicate;
    queryOperators: IQueryOperator[];

    onChangeFilter?(filter: UIQueryPredicate): void;

    onRemoveFilter?(id: string): void;
}

const compositionOptions = [];

const compositionReverseLookup = new Map<PredicateComposition, string>();
const compositionLookup = new Map<string, PredicateComposition>();
PredicateCompositions.map(c => {
    compositionLookup.set(c.label, c.value);
    compositionReverseLookup.set(c.value, c.label);
    compositionOptions.push({label: c.label, value: c.label})
});


export const QueryFilter = observer((props: IQueryFilterProps) => {
    const constants = useConstants();

    if (nodeStructureLookup.size == 0) {
        nodeStructureOptions = constants.NeuronStructures.map(q => {
            nodeStructureLookup.set(q.id, q);
            return {label: q.predicateName(), value: q.id}
        });
    }

    if (queryOperatorLookup.size == 0) {
        queryOperatorOptions = constants.QueryOperators.map(q => {
            queryOperatorLookup.set(q.id, q);
            return {label: q.display, value: q.id}
        });
    }

    const onCompositionChange = (value: PredicateComposition) => {
        const filter = props.queryFilter;
        filter.filter.composition = value;
        props.onChangeFilter?.(filter);
    };

    const onQueryOperatorChange = (operator: IQueryOperator) => {
        const filter = props.queryFilter;
        filter.filter.operator = operator;
        props.onChangeFilter?.(filter);
    };

    const onAmountChange = (value: string) => {
        const filter = props.queryFilter;
        filter.filter.amount = value;
        props.onChangeFilter?.(filter);
    };

    const onArbCenterChanged = (value: string, which: string) => {
        const filter = props.queryFilter;
        filter.filter.arbCenter[which] = value;
        props.onChangeFilter?.(filter);
    };

    const onArbSizeChanged = (value: string) => {
        const filter = props.queryFilter;
        filter.filter.arbSize = value;
        props.onChangeFilter?.(filter);
    };

    const onQueryTracingIdChanged = (value: string) => {
        const filter = props.queryFilter;
        filter.filter.labelsOrDois = value;
        props.onChangeFilter?.(filter);
    };

    const onBrainAreaChange = (brainAreas: AtlasStructureShape[]) => {
        const filter = props.queryFilter;
        filter.filter.brainAreas = brainAreas;
        props.onChangeFilter?.(filter);
    };

    const onBrainAreaFilterTypeChanged = (b: QueryPredicateKind) => {
        const filter = props.queryFilter;
        filter.brainAreaFilterType = b;
        props.onChangeFilter?.(filter);
    };

    const onNeuronalStructureChange = (neuronalStructures?: NeuronalStructure) => {
        const filter = props.queryFilter;
        filter.filter.updateNeuronalStructure(neuronalStructures);
        props.onChangeFilter?.(filter);
    };

    const onTracingIdsOrDOIsExactMatch = () => {
        const filter = props.queryFilter;
        filter.filter.tracingIdsOrDOIsExactMatch = !filter.filter.tracingIdsOrDOIsExactMatch;
        props.onChangeFilter?.(filter);
    };

    const renderComposition = () => {
        if (props.isComposite) {
            return <Select label="Condition" disabled={!props.isComposite} data={compositionOptions}
                           value={compositionReverseLookup.get(props.queryFilter.filter.composition)} onChange={(value) => {
                if (value) {
                    onCompositionChange(compositionLookup.get(value));
                }
            }}/>
        } else {
            return null;
        }
    };

    const renderRemoveElement = () => {
        if (props.isRemovable) {
            return (
                <ActionIcon size={36} variant="transparent" onClick={() => props.onRemoveFilter?.(props.queryFilter.id)}>
                    <IconX size={14} color="var(--mantine-color-gray-6)"/>
                </ActionIcon>
            )
        } else {
            return null;
        }
    };

    const renderAnatomicalRegionPredicate = () => {
        const filter = props.queryFilter.filter;

        const amountUnits = filter.amountUnits();

        const rightSection = amountUnits ? <Text size="xs">{amountUnits}</Text> : null;

        const opacity = props.queryFilter.filter.CanHaveThreshold ? 1 : 0.0;

        return (
            <Flex justify="stretch" align="center" direction="row" gap="md" p="0">
                <Select miw={200} label="Query Type" data={queryPredicateOptions} value={props.queryFilter.brainAreaFilterType.id} onChange={(value) => {
                    if (value) {
                        onBrainAreaFilterTypeChanged(queryPredicateLookup.get(value));
                    }
                }}/>
                <div style={{flex: 1}}>
                    <AtlasStructureMultiSelect label="Target Atlas Structures (multiple treated as an OR condition)" selection={filter.brainAreas}
                                               onSelectionChange={(brainAreas: AtlasStructureShape[]) => onBrainAreaChange(brainAreas)}/>
                </div>
                <Select label="Neuron Structure" clearable placeholder="any" data={nodeStructureOptions}
                        value={props.queryFilter.filter.neuronalStructure?.id ?? null} onChange={(value) => {
                    if (value) {
                        onNeuronalStructureChange(nodeStructureLookup.get(value));
                    } else {
                        onNeuronalStructureChange(null);
                    }
                }}/>
                <Select label="Threshold" clearable placeholder="any" disabled={!props.queryFilter.filter.CanHaveThreshold} data={queryOperatorOptions}
                        style={{opacity: opacity}} value={props.queryFilter.filter.operator?.id ?? null} onChange={(value) => {
                    if (value) {
                        onQueryOperatorChange(queryOperatorLookup.get(value));
                    } else {
                        onQueryOperatorChange(null);
                        onQueryOperatorChange(null);
                    }
                }}/>
                <TextInput miw={120} flex={0} label="&nbsp;" value={props.queryFilter.filter.amount} style={{opacity: opacity}}
                           disabled={!props.queryFilter.filter.CanHaveThreshold || props.queryFilter.filter.operator == null}
                           onChange={(evt) => onAmountChange(evt.currentTarget.value)}
                           rightSection={rightSection} rightSectionWidth={60}/>
            </Flex>
        );
    };

    const renderCustomRegionPredicate = () => {
        return (
            <Flex justify="stretch" align="center" direction="row" gap="md" p="0">
                <Select miw={200} label="Query Type" data={queryPredicateOptions} value={props.queryFilter.brainAreaFilterType.id} onChange={(value) => {
                    if (value) {
                        onBrainAreaFilterTypeChanged(queryPredicateLookup.get(value));
                    }
                }}/>
                <TextInput flex={1} label="X (µm)" value={props.queryFilter.filter.arbCenter.x}
                           onChange={(evt) => onArbCenterChanged(evt.currentTarget.value, "x")}/>
                <TextInput flex={1} label="Y (µm)" value={props.queryFilter.filter.arbCenter.y}
                           onChange={(evt) => onArbCenterChanged(evt.currentTarget.value, "y")}/>
                <TextInput flex={1} label="Z (µm)" value={props.queryFilter.filter.arbCenter.z}
                           onChange={(evt) => onArbCenterChanged(evt.currentTarget.value, "z")}/>
                <TextInput flex={1} label="Radius (µm)" value={props.queryFilter.filter.arbSize}
                           onChange={(evt) => onArbSizeChanged(evt.currentTarget.value)}/>
            </Flex>
        );
    };

    const renderIdOrDoiPredicate = () => {
        return (
            <Flex justify="stretch" align="center" direction="row" gap="md" p="0">
                <Select miw={200} label="Query Type" data={queryPredicateOptions} value={props.queryFilter.brainAreaFilterType.id} onChange={(value) => {
                    if (value) {
                        onBrainAreaFilterTypeChanged(queryPredicateLookup.get(value));
                    }
                }}/>
                <TextInput flex={1} label="Id or DOI (use comma-separated list for multiple)" value={props.queryFilter.filter.labelsOrDois}
                           onChange={(evt) => onQueryTracingIdChanged(evt.currentTarget.value)}/>
                <Checkbox style={{marginTop: "20px"}} label="Exact match" checked={props.queryFilter.filter.tracingIdsOrDOIsExactMatch}
                          onChange={() => onTracingIdsOrDOIsExactMatch()}/>
            </Flex>
        );
    };

    const chooseFilterRender = () => {
        switch (props.queryFilter.brainAreaFilterType.option) {
            case PredicateType.AnatomicalRegion:
                return renderAnatomicalRegionPredicate();
            case PredicateType.CustomRegion:
                return renderCustomRegionPredicate();
            case PredicateType.IdOrDoi:
                return renderIdOrDoiPredicate();
            default:
                return null;
        }
    };

    const isCompartment = props.queryFilter.brainAreaFilterType.IsCompartmentQuery;
    const isId = props.queryFilter.brainAreaFilterType.IsIdQuery;

    const width = props.isSolo ? 0 : 80;

    const style = Object.assign({}, listItemStyle, (isCompartment ? compartmentItemStyle : (isId ? idOrDoiItemStyle : sphereItemStyle)));

    return (
        <Flex justify="stretch" gap="md" align="center" p={8} bg="segment" style={style}>
            <div style={{width: `${width}px`}}>
                {renderComposition()}
            </div>
            <div style={{flex: 1}}>
                {chooseFilterRender()}
            </div>
            <div style={{marginTop: "18px"}}>
                {renderRemoveElement()}
            </div>
        </Flex>
    );
});

const listItemStyle: any = {
    marginBottom: "6px",
    borderRadius: "4px"
};

const compartmentItemStyle: any = {
    border: "1px solid #37503c",
    borderTop: "4px solid #37503c"
};

const sphereItemStyle: any = {
    border: "1px solid #314659",
    borderTop: "4px solid #314659"
};

const idOrDoiItemStyle: any = {
    border: "1px solid #0c8599",
    borderTop: "4px solid #0c8599"
};
