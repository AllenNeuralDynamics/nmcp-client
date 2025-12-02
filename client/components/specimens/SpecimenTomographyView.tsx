import * as React from "react";
import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Divider, Stack, useComputedColorScheme} from "@mantine/core";

import {TomographyViewer} from "../../viewer/tomographyViewer";
import {NeuroglancerControls} from "../common/NeuroglancerControls";
import {SpecimenShape} from "../../models/specimen";

export const SpecimenTomographyView = observer(({specimen}: { specimen: SpecimenShape }) => {
    const scheme = useComputedColorScheme();

    const [viewer, setViewer] = useState<TomographyViewer>(null);

    useEffect(() => {
        const v = new TomographyViewer("specimen-ng-container", scheme == "dark");

        v.updateState();

        if (specimen) {
            v.setTomography(specimen.label, specimen.tomography);
        }

        setViewer(v);

        return () => {
            v.unlink();
        }
    }, []);

    useEffect(() => {
        if (viewer) {
            viewer.setTomography(specimen.label, specimen.tomography);
        }
    }, [specimen]);

    useEffect(() => {
        if (viewer) {
            viewer.colorScheme = scheme == "dark";
        }
    }, [scheme]);

    return (
        <Stack gap={0} style={{flexGrow: 1}}>
            <NeuroglancerControls viewer={viewer}/>
            <Divider orientation="horizontal"/>
            <div id="specimen-ng-container" className="ng-default-container" style={{flexGrow: 1, minHeight: "600px"}}/>
        </Stack>
    )
});
