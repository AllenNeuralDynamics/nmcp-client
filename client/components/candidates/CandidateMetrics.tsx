import * as React from "react";
import {observer} from "mobx-react-lite";
import {Divider, Group, RangeSlider, Stack, Switch, Text} from "@mantine/core";

import {CandidateFilter} from "../../viewmodel/candidateFilter";

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
            <Group justify="left" align="center">
                <Switch label="Brightness"
                        checked={candidateFilter.limitBrightness}
                        onChange={(event) => {
                            candidateFilter.limitBrightness = event.currentTarget.checked;
                        }}/>
                <RangeSlider mb={16} miw={200} min={0} max={1000} disabled={!candidateFilter.limitBrightness} marks={createMarks([0, 1000])}
                             value={range} onChange={setRange} onChangeEnd={(r) => candidateFilter.brightnessRange = r}/>
                <Divider orientation="vertical"/>
                <Switch label="Volume"
                        checked={candidateFilter.limitVolume}
                        onChange={(event) => {
                            candidateFilter.limitVolume = event.currentTarget.checked;
                        }}/>
                <RangeSlider mb={16} miw={200} min={0} max={1000} disabled={!candidateFilter.limitVolume}
                             marks={createMarks([0, 1000])}
                             value={candidateFilter.volumeRange} onChange={(r) => candidateFilter.volumeRange = r}/>
            </Group>
        </Stack>
    )
});
