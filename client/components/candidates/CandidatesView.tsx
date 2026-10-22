import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import {ActionIcon, Box, Divider, Paper, Progress, Stack, Text, Tooltip, useComputedColorScheme} from "@mantine/core";
import {IconPin, IconPinned} from "@tabler/icons-react";

import {useAppLayout} from "../../hooks/useAppLayout";
import {usePreferences} from "../../hooks/usePreferences";
import {NeuronShape} from "../../models/neuron";
import {CandidateViewer} from "../../viewer/candidateViewer";
import {NeuroglancerControls} from "../common/NeuroglancerControls";
import {AtlasViewModel} from "../../viewmodel/atlasViewModel";
import {CandidateLocationLoader} from "../../viewmodel/candidateLocationLoader";

export interface CandidatesViewProps {
    atlasViewModel: AtlasViewModel;
    locationLoader: CandidateLocationLoader;
    selectedId: string | null;
    selectedNeuron: NeuronShape | null;

    onViewerSelected(id: string): void;
}

export const CandidatesView = observer((props: CandidatesViewProps) => {
    const [viewer, setViewer] = useState<CandidateViewer>(null);

    // The viewer's listener is installed once, so it reads the latest callback through a ref.
    const onViewerSelectedRef = useRef(props.onViewerSelected);
    onViewerSelectedRef.current = props.onViewerSelected;

    const preferences = usePreferences();

    const appLayout = useAppLayout();

    const pinned = appLayout.isCandidateViewerPinned;

    const scheme = useComputedColorScheme();

    useEffect(() => {
        const v = new CandidateViewer("candidate-ng-container", props.atlasViewModel, scheme == "dark");

        v.selectionListener = (id: string) => onViewerSelectedRef.current(id);

        v.updateState(preferences.candidateViewerState);

        props.locationLoader.attach(v);

        v.select(props.selectedId ? {id: props.selectedId, neuron: props.selectedNeuron} : null);

        setViewer(v);

        return () => {
            props.locationLoader.detach();
            v.unlink();
        }
    }, []);

    useEffect(() => {
        if (viewer) {
            viewer.colorScheme = scheme == "dark";
        }
    }, [scheme]);

    useEffect(() => {
        viewer?.select(props.selectedId ? {id: props.selectedId, neuron: props.selectedNeuron} : null);
    }, [viewer, props.selectedId, props.selectedNeuron]);

    const {isLoading, loaded, total} = props.locationLoader;

    const progress = total ? Math.min(100, 100 * loaded / total) : 0;

    return (
        <Stack gap={0} style={{flexGrow: 1}}>
            {/* The controls set flexGrow for row layouts; the wrapper keeps them from taking a share of the height here. */}
            <div>
                <NeuroglancerControls viewer={viewer} allowResetView={true} allowStateExport={false}>
                    <Tooltip label={pinned ? "Unpin the viewer so it scrolls with the page" : "Pin the viewer to the bottom of the page"}>
                        <ActionIcon variant={pinned ? "light" : "subtle"} aria-label={pinned ? "Unpin viewer" : "Pin viewer"}
                                    aria-pressed={pinned} onClick={() => appLayout.toggleCandidateViewerPinned()}>
                            {pinned ? <IconPinned size={18}/> : <IconPin size={18}/>}
                        </ActionIcon>
                    </Tooltip>
                </NeuroglancerControls>
            </div>
            <Divider orientation="horizontal"/>
            <Box pos="relative" style={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
                <div id="candidate-ng-container" className="ng-default-container" style={{flexGrow: 1, minHeight: "400px"}}/>
                {isLoading ?
                    <Paper pos="absolute" top={8} left={8} p={8} withBorder style={{pointerEvents: "none"}}>
                        <Text size="xs">{`Loading soma locations ${loaded.toLocaleString()} of ${total?.toLocaleString() ?? "…"}`}</Text>
                        <Progress size="sm" w={220} mt={4} value={progress}/>
                    </Paper> : null}
            </Box>
        </Stack>
    );
});
