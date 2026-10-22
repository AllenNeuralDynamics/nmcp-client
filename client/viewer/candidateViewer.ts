import {AnnotationType} from "neuroglancer/unstable/annotation/index.js";

import {AtlasViewer} from "./atlasViewer";
import {AtlasViewModel} from "../viewmodel/atlasViewModel";
import {LayerType, NeuroglancerLayerSource} from "./neuroglancerLayer";
import {NeuronShape} from "../models/neuron";
import {CandidatePointSink} from "../viewmodel/candidateLocationLoader";
import {candidatePoints, toViewerPoint} from "./candidatePoints";

export type SelectionListener = (id: string) => void;

export type CandidateSelection = {
    id: string;
    neuron: NeuronShape | null;
}

const CandidatesLayerName = "Candidates";
const SelectionLayerName = "Selection";

const candidateShader = "\nvoid main() {\n  setColor(vec4(0.129, 0.518, 0.816, 1.0));\n  setPointMarkerBorderWidth(0.1);\n  setPointMarkerBorderColor(vec4(0.0, 0.0, 0.0, 1.0));\n  setPointMarkerSize(5.0);\n}\n";

const dimmedCandidateShader = "\nvoid main() {\n  setColor(vec4(0.129, 0.518, 0.816, 0.2));\n  setPointMarkerBorderWidth(0.1);\n  setPointMarkerBorderColor(vec4(0.0, 0.0, 0.0, 1.0));\n  setPointMarkerSize(3.0);\n}\n";

const selectionShader = "\nvoid main() {\n  setColor(vec4(0.0, 1.0, 0.0, 1.0));\n  setPointMarkerBorderWidth(0.1);\n  setPointMarkerBorderColor(vec4(1.0, 1.0, 1.0, 1.0));\n  setPointMarkerSize(5.0);\n}\n";

// No annotate tool, so every annotation id in either layer is a neuron id, and no per-point properties: selection is a
// separate one-point layer, and dimming is a shader swap.
function pointLayerSource(name: string, shader: string): NeuroglancerLayerSource {
    return {
        name,
        type: LayerType.annotation,
        source: "local://annotations",
        options: {
            tab: "annotations",
            annotationColor: "#2184d0",
            annotations: [],
            shader
        }
    };
}

const candidatesLayerSource = pointLayerSource(CandidatesLayerName, candidateShader);
const selectionLayerSource = pointLayerSource(SelectionLayerName, selectionShader);

type AnnotationOperation = (source: any) => void;

export class CandidateViewer extends AtlasViewer implements CandidatePointSink {
    private _selectionListener: SelectionListener;

    private _selectedId: string | null = null;

    // A layer's local annotation source appears asynchronously after every state restore, so operations wait here,
    // per layer, until it exists.
    private readonly _pending = new Map<string, AnnotationOperation[]>();

    private _readyDisposer: () => void = null;

    public constructor(elementId: string, atlasViewModel: AtlasViewModel, isDarkColorScheme: boolean = false) {
        super(elementId, atlasViewModel, isDarkColorScheme);

        if (this.viewer) {
            this._readyDisposer = this.viewer.layerManager.readyStateChanged.add(() => this.flush());
        }
    }

    public set selectionListener(listener: SelectionListener) {
        this._selectionListener = listener;
    }

    // A saved state can predate these layer definitions, and an old per-point-property Candidates layer would reject
    // the property-less points, so the saved copies are replaced with the current ones.
    public updateState(state?: object | null) {
        if (state) {
            const current: any = {
                ...state,
                layers: ((state as any).layers ?? []).filter((layer: any) => layer.name !== CandidatesLayerName && layer.name !== SelectionLayerName)
            };

            this.ensureLayer(candidatesLayerSource, current);
            this.ensureLayer(selectionLayerSource, current);

            super.updateState(current);
        } else {
            super.updateState(state);
        }
    }

    public clearCandidates(): void {
        this.withAnnotations(CandidatesLayerName, source => source.clear());
    }

    public addCandidates(ids: string[], locations: (number[] | null)[]): void {
        const points = candidatePoints(ids, locations);

        this.withAnnotations(CandidatesLayerName, source => {
            for (const {id, point} of points) {
                if (source.get(id) === undefined) {
                    source.add(pointAnnotation(id, point)).dispose();
                }
            }
        });
    }

    public removeCandidate(id: string): void {
        this.withAnnotations(CandidatesLayerName, source => {
            const reference = source.getReference(id);
            source.delete(reference);
            reference.dispose();
        });
    }

    public select(selection: CandidateSelection | null): void {
        if (!this.viewer) {
            return;
        }

        const id = selection?.id ?? null;
        const changed = id !== this._selectedId;

        this._selectedId = id;

        let point = toViewerPoint(selection?.neuron?.atlasSoma);

        if (!point && id) {
            const plotted = this.localAnnotations(CandidatesLayerName)?.get(id)?.point;

            point = plotted ? Float32Array.from(plotted) : null;
        }

        this.withAnnotations(SelectionLayerName, source => {
            source.clear();

            if (point) {
                source.add(pointAnnotation(id, point)).dispose();
            }
        });

        const candidates: any = this.viewer.layerManager.getLayerByName(CandidatesLayerName)?.layer;

        if (candidates?.annotationDisplayState) {
            candidates.annotationDisplayState.shader.value = id ? dimmedCandidateShader : candidateShader;
        }

        if (changed && point) {
            this.viewer.position.value = point;
        }

        const structureId = selection?.neuron?.atlasStructure?.structureId;

        if (!id || structureId || changed) {
            this.showAtlasStructures(structureId ? [structureId] : [], true);
        }
    }

    public unlink(): void {
        if (this._readyDisposer) {
            this._readyDisposer();
            this._readyDisposer = null;
        }

        super.unlink();
    }

    protected get defaultState() {
        const state: any = super.defaultState;

        state.title = "Candidates";

        this.ensureLayer(candidatesLayerSource, state);
        this.ensureLayer(selectionLayerSource, state);

        return state;
    }

    protected onSelectionChanged(layerSelection: any) {
        const id = layerSelection?.[CandidatesLayerName]?.annotationId ?? layerSelection?.[SelectionLayerName]?.annotationId;

        if (id && this._selectionListener) {
            this._selectionListener(id);
        }
    }

    // Looked up on every use: any state restore replaces the source.
    private localAnnotations(layerName: string): any {
        return (this.viewer?.layerManager.getLayerByName(layerName)?.layer as any)?.localAnnotations;
    }

    private withAnnotations(layerName: string, operation: AnnotationOperation): void {
        const queue = this._pending.get(layerName) ?? [];

        queue.push(operation);

        this._pending.set(layerName, queue);

        this.flush();
    }

    private flush(): void {
        for (const [layerName, queue] of this._pending) {
            const source = this.localAnnotations(layerName);

            if (!source) {
                continue;
            }

            while (queue.length > 0) {
                queue.shift()(source);
            }
        }
    }
}

function pointAnnotation(id: string, point: Float32Array) {
    return {
        type: AnnotationType.POINT,
        id,
        point,
        description: null as string,
        properties: [] as any[],
        relatedSegments: [] as BigUint64Array[]
    };
}
