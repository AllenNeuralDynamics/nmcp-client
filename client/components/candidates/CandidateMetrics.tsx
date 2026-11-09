import * as React from "react";
import {observer} from "mobx-react-lite";
import {Divider, Group, RangeSlider, Stack, Switch, Text} from "@mantine/core";

import {BrightnessBounds, CandidateFilter, VolumeBounds} from "../../viewmodel/candidateFilter";

function createMarks(range: [number, number]) {
    return [
        {value: range[0], label: `${range[0].toFixed(0)}`},
        {value: range[1], label: `${range[1].toFixed(0)}`}
    ];
}

export const CandidateMetrics = observer(({candidateFilter}: { candidateFilter: CandidateFilter }) => {
    const [range, setRange] = React.useState<[number, number]>(candidateFilter.brightnessRange);

    return (
        <Stack p={12} justify="left">
            <Text fw={500}>Use Metrics</Text>
            <Group mb={16} justify="left" align="center">
                <Switch label="Brightness"
                        checked={candidateFilter.limitBrightness}
                        onChange={(event) => {
                            candidateFilter.limitBrightness = event.currentTarget.checked;
                        }}/>
                <RangeSlider miw={200} min={BrightnessBounds[0]} max={BrightnessBounds[1]} disabled={!candidateFilter.limitBrightness} marks={createMarks(BrightnessBounds)}
                             value={range} onChange={setRange} onChangeEnd={(r) => candidateFilter.brightnessRange = r}/>
                <Divider orientation="vertical"/>
                <Switch label="Volume"
                        checked={candidateFilter.limitVolume}
                        onChange={(event) => {
                            candidateFilter.limitVolume = event.currentTarget.checked;
                        }}/>
                <RangeSlider miw={200} min={VolumeBounds[0]} max={VolumeBounds[1]} disabled={!candidateFilter.limitVolume}
                             marks={createMarks(VolumeBounds)}
                             value={candidateFilter.volumeRange} onChange={(r) => candidateFilter.volumeRange = r}/>
            </Group>
        </Stack>
    )
});
