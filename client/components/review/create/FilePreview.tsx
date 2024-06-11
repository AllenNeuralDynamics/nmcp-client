import * as React from "react";
import {CSSProperties, useEffect, useState} from "react";

import {SceneViewer} from "./sceneViewer";

export class SwcInputFile {
    file: File;
    nodeCount: number;
}

type FilePreviewProps = {
    style?: CSSProperties
    file: File;

    onFileReceived(file: File): void;
    onFileIsInvalid(): void;
    onFileLoaded(swcInputFile: SwcInputFile): void;
}

export const FilePreview = (props: FilePreviewProps) => {
    const [sceneViewer, setSceneViewer] = useState<SceneViewer>(null);

    useEffect(() => {
        setSceneViewer(new SceneViewer("viewer-container"));
    }, []);

    useEffect(() => {
        if (sceneViewer != null) {
            sceneViewer.loadFile(props.file)
                .then(swcFile => props.onFileLoaded(swcFile))
                .catch(() => props.onFileIsInvalid());
        }
    }, [props.file]);

    const style = Object.assign({}, props.style || {}, {
        border: "none"
    });

    return (
        <div id="viewer-container" onDrop={(evt: any) => {
            evt.preventDefault();
            if (evt.dataTransfer.items.length > 0 && evt.dataTransfer.items[0].kind == "file") {
                props.onFileReceived(evt.dataTransfer.items[0].getAsFile());
            }
        }} onDragOver={(evt: any) => {
            evt.preventDefault();
            evt.dataTransfer.dropEffect = "copy";
        }} style={style}/>
    );
}
