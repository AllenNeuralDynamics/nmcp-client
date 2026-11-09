import * as React from "react";
import {Divider, Group, Switch} from "@mantine/core";

import {SpecimenFilter} from "../common/filters/SpecimenFilter";
import {ReconstructionStatusFilter} from "../common/filters/ReconstructionStatusFilter";
import {OptionalFilter} from "../../viewmodel/candidateFilter";
import {filterableAnnotationStatuses} from "../../models/annotationStatus";
import {ResetFiltersButton} from "../common/ResetFiltersButton";

const statusFilterOptions = filterableAnnotationStatuses();

export function ReconstructionFilters(props: {
    checked: boolean,
    onChange: (evt) => void,
    filter: OptionalFilter<string[]>,
    filter1: OptionalFilter<number[]>,
    onReset: () => void
}) {
    return <Group p={12} justify="left" align="center">
        <Switch label="My reconstructions only" checked={props.checked} onChange={props.onChange}/>
        <Divider orientation="vertical"/>
        <SpecimenFilter w={300} filter={props.filter}/>
        <Divider orientation="vertical"/>
        <ReconstructionStatusFilter w={300} filter={props.filter1} allowedValues={statusFilterOptions}/>
        <Group ml="auto">
            <ResetFiltersButton onReset={props.onReset}/>
        </Group>
    </Group>;
}
