import * as React from "react";
import {observer} from "mobx-react";
import {Checkbox, Dropdown, List, Segment} from "semantic-ui-react";

import {BrainAreaMultiSelect} from "../common/BrainAreaMultiSelect";
import {IBrainArea} from "../../models/brainArea";
import {NeuronTagFilter} from "../common/NeuronTagFilter";
import {useQuery} from "@apollo/client";
import {SAMPLES_QUERY, SamplesQueryResponse} from "../../graphql/sample";
import {CandidateFilter} from "../../viewmodel/candidateFilter";

export type CandidateFilterPanelProps = {
    candidateFilter: CandidateFilter;
}

export const CandidateFilterPanel = observer<React.FC<CandidateFilterPanelProps>>(({candidateFilter}) => {
    const {loading, error, data} = useQuery<SamplesQueryResponse>(SAMPLES_QUERY, {fetchPolicy: "cache-first"});

    let sampleFilterOptions = [];

    if (!loading && !error) {
        sampleFilterOptions = data.samples.items.slice().sort((s1, s2) => s1.animalId < s2.animalId ? -1 : 1).map(s => {
            return {key: s.id, text: s.animalId, value: s.id}
        });
    }

    return (
        <Segment secondary>
            <List horizontal divided>
                <List.Item>
                    <Checkbox style={{verticalAlign: "middle"}} toggle label="Include in progress"
                              checked={candidateFilter.includeInProgress}
                              onChange={(_, data) => {
                                  candidateFilter.includeInProgress = data.checked;
                                  candidateFilter.offset = 0
                              }}/>
                </List.Item>
                <List.Item>
                    <Checkbox style={{verticalAlign: "middle"}} toggle label="Limit samples "
                              checked={candidateFilter.limitSamples}
                              onChange={(_, data) => {
                                  candidateFilter.limitSamples = data.checked;
                                  if (candidateFilter.sampleFilter.length != 0) {
                                      candidateFilter.offset = 0
                                  }
                              }}/>

                    <Dropdown placeholder="Select..." style={{marginLeft: "8px"}} multiple selection
                              options={sampleFilterOptions}
                              value={candidateFilter.sampleFilter}
                              disabled={!candidateFilter.limitSamples}
                              onChange={(_, d) => {
                                  candidateFilter.sampleFilter = d.value as any;
                                  candidateFilter.offset = 0
                              }}/>
                </List.Item>
                <List.Item>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <Checkbox toggle label="Limit structures " checked={candidateFilter.limitBrainAreas}
                                  onChange={(_, data) => {
                                      candidateFilter.limitBrainAreas = data.checked;
                                      if (candidateFilter.brainAreaFilter.length != 0) {
                                          candidateFilter.offset = 0
                                      }
                                  }}/>

                        <div style={{marginLeft: "8px", minWidth: "200px"}}>
                            <BrainAreaMultiSelect selection={candidateFilter.brainAreaFilter} disabled={!candidateFilter.limitBrainAreas}
                                                  onSelectionChange={(brainAreas: IBrainArea[]) => {
                                                      candidateFilter.brainAreaFilter = brainAreas;
                                                      candidateFilter.offset = 0
                                                  }}/>
                        </div>
                    </div>
                </List.Item>
                <List.Item>
                    <NeuronTagFilter
                        checked={candidateFilter.limitTags}
                        initialValue={candidateFilter.tagFilter}
                        onCheckedChange={(checked) => {
                            candidateFilter.limitTags = checked;
                            if (candidateFilter.tagFilter.length != 0) {
                                candidateFilter.offset = 0
                            }
                        }}
                        onValueChange={(value) => {
                            candidateFilter.tagFilter = value;
                            candidateFilter.offset = 0
                        }}
                    />
                </List.Item>
            </List>
        </Segment>
    );
})
