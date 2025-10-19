import * as React from "react";
import {observer} from "mobx-react-lite";
import {Divider, Group, NumberInput, Select, Stack, Switch, Text} from "@mantine/core";

import {CandidateFilter} from "../../viewmodel/candidateFilter";

export const CandidateMetrics = observer(({candidateFilter}: { candidateFilter: CandidateFilter }) => {
    return (
        <Stack p={12} justify="left">
            <Text fw={500}>Use Metrics</Text>
            <Group justify="left" align="center">
                <Switch label="Brightness"
                        checked={candidateFilter.limitBrightness}
                        onChange={(event) => {
                            candidateFilter.limitBrightness = event.currentTarget.checked;
                        }}/>
                <Select style={{maxWidth: "80px"}} disabled={!candidateFilter.limitBrightness} withCheckIcon={false}
                        data={[{value: "2", label: "≤"}, {value: "3", label: "≥"}]}
                        value={candidateFilter.brightnessOperator}
                        onChange={(value) => {
                            if (value) {
                                candidateFilter.brightnessOperator = value;
                            }
                        }}/>
                <NumberInput style={{maxWidth: "80px"}} disabled={!candidateFilter.limitBrightness} min={0} hideControls
                             value={candidateFilter.brightness} onChange={(value) => {
                    candidateFilter.setBrightness(value);
                }}/>
                <Divider orientation="vertical"/>
                <Switch label="Volume"
                        checked={candidateFilter.limitVolume}
                        onChange={(event) => {
                            candidateFilter.limitVolume = event.currentTarget.checked;
                        }}/>
                <Select style={{maxWidth: "80px"}} disabled={!candidateFilter.limitVolume} withCheckIcon={false}
                        data={[{value: "2", label: "≤"}, {value: "3", label: "≥"}]}
                        value={candidateFilter.volumeOperator}
                        onChange={(value) => {
                            if (value) {
                                candidateFilter.volumeOperator = value;
                            }
                        }}/>
                <NumberInput style={{maxWidth: "80px"}} disabled={!candidateFilter.limitVolume} min={0} hideControls
                             value={candidateFilter.volume} onChange={(value) => {
                    candidateFilter.setVolume(value);
                }}/>
            </Group>
        </Stack>
    )
});
