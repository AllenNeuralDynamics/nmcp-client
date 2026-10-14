import * as React from "react";
import {observer} from "mobx-react-lite";
import {Divider, Group} from "@mantine/core";

import {CandidateIncludeFilter} from "./CandidateIncludeFilter";
import {NeuronTagFilter} from "../common/filters/NeuronTagFilter";
import {NeuronGenotypeFilter} from "../common/filters/NeuronGenotypeFilter";
import {SpecimenFilter} from "../common/filters/SpecimenFilter";
import {AtlasStructureMultiSelectFilter} from "../common/filters/AtlasStructureMultiSelectFilter";
import {CandidateFilter} from "../../viewmodel/candidateFilter";

export const CandidateFilters = observer(({candidateFilter}: { candidateFilter: CandidateFilter }) => {
    return (
        <Group p={12} justify="left" align="center">
            <CandidateIncludeFilter candidateFilter={candidateFilter}/>

            <Divider orientation="vertical"/>

            <SpecimenFilter w={160} filter={candidateFilter.samplesFilter}/>

            <Divider orientation="vertical"/>

            <AtlasStructureMultiSelectFilter w={300} atlasId={candidateFilter.atlasId} filter={candidateFilter.atlasStructureFilter}/>

            <Divider orientation="vertical"/>

            <NeuronTagFilter filter={candidateFilter.tagFilter}/>

            <Divider orientation="vertical"/>

            <NeuronGenotypeFilter w={260} filter={candidateFilter.genotypeFilter}/>
        </Group>
    );
})
