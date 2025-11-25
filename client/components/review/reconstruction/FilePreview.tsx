import * as React from "react";
import {CSSProperties, useEffect, useState} from "react";
import {useComputedColorScheme} from "@mantine/core";
import {useResizeObserver} from "@mantine/hooks";

import {SceneViewer} from "../../../viewer/preview/sceneViewer";
import {NeuronStructureKind} from "../../../models/neuronStructure";
import {viewerBackgroundDark, viewerBackgroundDarkString, viewerBackgroundLight, viewerBackgroundLightString} from "../../../index";

type FilePreviewProps = {
    style?: CSSProperties
    elementName: string;
    files: File[];
    forceStructure?: NeuronStructureKind;

    onDrop?(file: File): void;
    onDrops?(files: File[]): void;
    onInvalid(): void;
    onLoaded(nodeCount: [number, number]): void;
}

export const FilePreview = (props: FilePreviewProps) => {
    const [sceneViewer, setSceneViewer] = useState<SceneViewer>(null);

    const [ref, rect] = useResizeObserver();

    const computedColorScheme = useComputedColorScheme("light");

    useEffect(() => {
        const viewer = new SceneViewer(props.elementName, computedColorScheme == "light" ? viewerBackgroundLight : viewerBackgroundDark);
        viewer.SceneManager.setSize(rect.width, rect.height);
        setSceneViewer(viewer);
    }, []);

    useEffect(() => {
        sceneViewer?.setBackground(computedColorScheme == "light" ? viewerBackgroundLight : viewerBackgroundDark);
    }, [computedColorScheme]);

    useEffect(() => {
        sceneViewer?.SceneManager?.setSize(rect.width, rect.height);
    }, [rect]);

    useEffect(() => {
        if (sceneViewer == null) {
            return;
        }

        let interrupted = false;

        if (props.files.length == 0) {
            sceneViewer.removeNeurons();
            return;
        }

        const loadData = async () => {
            try {
                if (props.files.length == 1) {
                    const count = await sceneViewer.loadFile(props.files[0]);

                    if (!interrupted) {
                        props.onLoaded(count);
                    }
                } else if (props.files.length == 2) {
                    sceneViewer.removeNeurons();

                    const axonCount = props.files[0] ? await sceneViewer.loadFile(props.files[0], NeuronStructureKind.axon, true) : [0, 0];
                    const dendriteCount = props.files[1] ? await sceneViewer.loadFile(props.files[1], NeuronStructureKind.dendrite, true) : [0, 0];

                    if (!interrupted) {
                        props.onLoaded([axonCount[0], dendriteCount[1]]);
                    }
                } else {
                    if (!interrupted) {
                        sceneViewer.removeNeurons();
                    }
                }
            } catch (error) {
                if (!interrupted) {
                    props.onInvalid();
                }
            }
        };

        loadData();

        return () => {
            interrupted = true;
        };
    }, [props.files, props.forceStructure]);

    sceneViewer?.SceneManager?.setSize(rect.width, rect.height);

    const onDrop = (evt: React.DragEvent<HTMLDivElement>) => {
        evt.preventDefault();

        const files = Array.from<DataTransferItem>(evt.dataTransfer.items).filter(item => item.kind == "file");

        if (files.length > 0) {
            if (props.onDrop) {
                props.onDrop(files[0].getAsFile());
            }
            if (props.onDrops) {
                props.onDrops(files.map(f => f.getAsFile()));
            }
        }
    };

    const onDragOver = (evt: React.DragEvent<HTMLDivElement>) => {
        evt.preventDefault();

        const files = Array.from<DataTransferItem>(evt.dataTransfer.items).filter(item => item.kind == "file");

        if (files.length > 2) {
            evt.dataTransfer.dropEffect = "none";
        } else {
            evt.dataTransfer.dropEffect = "copy";
        }
    };

    const divProps = {...(props.style || {}), backgroundColor: computedColorScheme == "light" ? viewerBackgroundLightString : viewerBackgroundDarkString}

    return <div id={props.elementName} ref={ref} style={divProps} onDrop={onDrop} onDragOver={onDragOver}/>;
}
