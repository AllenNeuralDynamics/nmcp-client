import * as React from "react";
import {observe} from "mobx";
import {observer} from "mobx-react";
import * as _ from "lodash-es";

import {ITracingNode} from "../../models/tracingNode";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {NdbConstants} from "../../models/constants";
import {BrainCompartmentViewModel} from "../../viewmodel/brainCompartmentViewModel";
import {IPositionInput} from "../../models/queryFilter";
import {ViewerMouseHandler} from "../../viewer/viewMouseHandler";
import {SharkViewer} from "../../viewer/shark_viewer";
import {ViewerSelection} from "./ViewerSelection";
import {INotificationListener} from "../../util/preferencesManager";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {SlicePlane} from "../../services/sliceService";
import {TomographyConstants} from "../../tomography/tomographyConstants";
import {rootViewModel} from "../../store/viewModel/systemViewModel";
import {SliceManager} from "../../tomography/sliceManager";
import {TomographyViewModel} from "../../store/viewModel/tomographyViewModel";
import {TracingStructure} from "../../models/tracingStructure";
import {AxisViewer} from "../../viewer/axisView";
import * as Color from "color";
import {CompartmentMeshSet, ViewerMeshVersion} from "../../models/compartmentMeshSet";
import {ViewerStyle} from "../../viewer/viewerStyle";
import {NeuroglancerContainer} from "./NeuroglancerContainer";
import {UserPreferences} from "../../util/userPreferences";

const ROOT_ID = 997;

const tomographyConstants = TomographyConstants.Instance;

export enum HighlightSelectionMode {
    Normal,
    Cycle
}

export interface ITracingViewerBaseProps {
    constants: NdbConstants;
    compartments: BrainCompartmentViewModel[];
    tracings: TracingViewModel[];
    skeletonSegmentIds: number[];
    isLoading: boolean;
    isRendering: boolean;
    fixedAspectRatio?: number;
    displayHighlightedOnly: boolean;
    highlightSelectionMode: HighlightSelectionMode;
    cycleFocusNeuronId: string;

    onChangeIsRendering?(isRendering: boolean): void;

    onHighlightTracing(neuron: NeuronViewModel, highlight?: boolean): void;

    onSelectNode?(tracing: TracingViewModel, node: ITracingNode): void;

    onToggleTracing(id: string): void;

    onToggleCompartment(id: string): void;

    onToggleDisplayHighlighted(): void;

    onChangeHighlightMode(): void;

    onSetHighlightedNeuron(neuron: NeuronViewModel): void;

    onCycleHighlightNeuron(direction: number): void;

    populateCustomPredicate(position: IPositionInput, replace: boolean): void;

    onChangeNeuronViewMode(neuron: NeuronViewModel, viewMode: NeuronViewMode): void;
}

interface ITracingViewerProps extends ITracingViewerBaseProps {
}

interface ITracingViewerState {
    renderWidth?: number;
    renderHeight?: number;

    selectedTracing?: TracingViewModel;
    selectedNode?: ITracingNode;
}

@observer
export class TracingViewer extends React.Component<ITracingViewerProps, ITracingViewerState> implements INotificationListener {
    private _viewer: any = null;
    private _axisViewer: AxisViewer;

    private _loadedVolumes: string[] = [];
    private _knownVolumes = new Set<string>();

    private _loadedNeurons: string[] = [];
    private _knownNeurons = new Set<string>();

    private _neuronColors = new Map<string, string>();

    private _tracingRadiusFactor = UserPreferences.Instance.TracingRadiusFactor;

    private _sliceManager = null;

    private _disposer1 = null;
    private _disposer2 = null;

    private _compartmentMeshSet: CompartmentMeshSet;

    public constructor(props: ITracingViewerProps) {
        super(props);

        this.state = {
            renderWidth: 0,
            renderHeight: 0,
            selectedTracing: null,
            selectedNode: null
        }
    }

    private set MeshSet(m: CompartmentMeshSet) {
        if (this._compartmentMeshSet?.Version == m?.Version) {
            return;
        }

        this._loadedVolumes = [];
        this._knownVolumes.clear();

        this._compartmentMeshSet = m;

        if (this._viewer != null) {
            this._axisViewer.MeshVersion = this._compartmentMeshSet;
            this._viewer.MeshVersion = this._compartmentMeshSet;

            this.renderCompartments(this.props);
        }
    }

    private lookupBrainArea(id: string | number) {
        return this.props.constants.findBrainArea(id);
    }

    public async componentDidMount() {
        this.updateDimensions();

        window.addEventListener("resize", () => this.updateDimensions());

        UserPreferences.Instance.addListener(this);

        this.prepareAndRenderTracings(this.props);

        const tomography = rootViewModel.Tomography;

        observe(tomography.Sagittal, async (change) => {
            if (!this._sliceManager) {
                return;
            }

            switch (change.name) {
                case "IsEnabled":
                    await this.setSliceVisible(SlicePlane.Sagittal, tomography.Sagittal.IsEnabled);
                    break;
                case "Location":
                    await this._sliceManager.updateSlice(SlicePlane.Sagittal, tomography.Sagittal.Location);
                    break;
            }
        });

        observe(tomography.Horizontal, async (change) => {
            if (!this._sliceManager) {
                return;
            }

            switch (change.name) {
                case "IsEnabled":
                    await this.setSliceVisible(SlicePlane.Horizontal, tomography.Horizontal.IsEnabled);
                    break;
                case "Location":
                    await this._sliceManager.updateSlice(SlicePlane.Horizontal, tomography.Horizontal.Location);
                    break;
            }
        });

        observe(tomography.Coronal, async (change) => {
            if (!this._sliceManager) {
                return;
            }

            switch (change.name) {
                case "IsEnabled":
                    await this.setSliceVisible(SlicePlane.Coronal, tomography.Coronal.IsEnabled);
                    break;
                case "Location":
                    await this._sliceManager.updateSlice(SlicePlane.Coronal, tomography.Coronal.Location);
                    break;
            }
        });

        observe(tomography, async (change: any) => {
            if (!this._sliceManager) {
                return;
            }

            if (change.name === "_selection") {
                if (tomography.Selection) {
                    await this._sliceManager.setSampleId(tomography.Selection.SampleTomography.Id, tomography.CurrentLocation);

                    await this.registerSelectionObservers(tomography);

                    await this._sliceManager.setThreshold(tomography.Selection.UseCustomThreshold ? tomography.Selection.CustomThreshold.Values : null, tomography.CurrentLocation)
                }
            }
        });

        await this.registerSelectionObservers(tomography);
    }

    private async registerSelectionObservers(tomography: TomographyViewModel) {
        if (this._disposer1) {
            this._disposer1();
            this._disposer1 = null;
        }

        if (this._disposer2) {
            this._disposer2();
            this._disposer2 = null;
        }

        if (tomography.Selection != null) {
            this._disposer1 = observe(tomography.Selection, async (change) => {
                if (tomography.Selection && this._sliceManager) {
                    await this._sliceManager.setThreshold(tomography.Selection.UseCustomThreshold ? tomography.Selection.CustomThreshold.Values : null, tomography.CurrentLocation)
                }
            });

            this._disposer2 = observe(tomography.Selection.CustomThreshold, async (change) => {
                if (tomography.Selection && this._sliceManager) {
                    await this._sliceManager.setThreshold(tomography.Selection.UseCustomThreshold ? tomography.Selection.CustomThreshold.Values : null, tomography.CurrentLocation)
                }
            });
        }
    }

    public componentWillUnmount() {
        window.removeEventListener("resize", () => this.updateDimensions());

        UserPreferences.Instance.removeListener(this);
    }

    public componentWillReceiveProps(props: ITracingViewerProps) {
        this.prepareAndRenderTracings(props);

        this.updateDimensions();
    }

    public preferenceChanged(name: string) {
        if (name === "viewerBackgroundColor") {
            if (this._viewer) {
                this._viewer.setBackground(parseInt(UserPreferences.Instance.ViewerBackgroundColor.slice(1), 16));
            }
        }
    }

    public reset() {
        if (this._viewer) {
            this._viewer.onResetView(0, 0);
        }
        this.setState({selectedNode: null, selectedTracing: null});
    }

    public resetView(r1, r2) {
        if (this._viewer) {
            this._viewer.onResetView(r1, r2);
        }
    }

    private onToggleDisplayHighlighted() {
        //this._displayHighlightedOnly = !this._displayHighlightedOnly;

        //this.prepareAndRenderTracings(this.props);
        this.props.onToggleDisplayHighlighted();
    }

    private async createSharkViewer(width: number, height: number) {
        if (!this._viewer) {
            const a = new AxisViewer();
            a.dom_element = "axis-viewer-container";
            a.WIDTH = 100;
            a.HEIGHT = 100;

            a.init();

            a.animate();

            const s = new SharkViewer();

            s.dom_element = "viewer-container";
            s.centerPoint = [tomographyConstants.Sagittal.Center, tomographyConstants.Horizontal.Center, tomographyConstants.Coronal.Center];
            s.metadata = false;
            s.WIDTH = width;
            s.HEIGHT = height;
            s.on_select_node = (tracingId: string, sampleNumber: number, event) => this.onSelectNode(tracingId, sampleNumber, event);
            s.on_toggle_node = (tracingId: string) => this.props.onToggleTracing(tracingId);

            s.init();
            s.setBackground(parseInt(UserPreferences.Instance.ViewerBackgroundColor.slice(1), 16));

            s.animate();

            s.addEventHandler(new ViewerMouseHandler());

            s.addCameraObserver(a);

            this._viewer = s;

            this._sliceManager = new SliceManager(this._viewer.Scene);

            const tomography = rootViewModel.Tomography;

            if (tomography.Selection) {
                await this._sliceManager.setSampleId(tomography.Selection.SampleTomography.Id, tomography.CurrentLocation);
            }

            this._axisViewer = a;

            this.MeshSet = new CompartmentMeshSet(ViewerMeshVersion.AibsCcf);
        }
    }

    private calculateDimensions() {
        const container = document.getElementById("viewer-parent");

        if (!container) {
            return {width: 0, height: 0};
        }

        let width = container.clientWidth;
        let height = container.clientHeight;

        if (this.props.fixedAspectRatio) {
            width = Math.min(width, height * this.props.fixedAspectRatio);

            const aspectRatio = width / height;

            if (aspectRatio > this.props.fixedAspectRatio) {
                // constrained by height
                width = this.props.fixedAspectRatio * height;
            } else {
                // constrained by width
                height = width / this.props.fixedAspectRatio;
            }
        }

        return {width, height};
    }

    private updateDimensions() {
        const {width, height} = this.calculateDimensions();

        this.setState({renderWidth: width, renderHeight: height});

        if (this._viewer) {
            this._viewer.setSize(width, height);
        }
    }

    private renderCompartments(props: ITracingViewerProps) {
        if (!this._viewer) {
            return;
        }

        const meshPath = this._compartmentMeshSet.MeshPath ?? "";

        const displayCompartments = props.compartments.filter(c => c.isDisplayed);

        if (displayCompartments.length === 0) {
            this._loadedVolumes.map(id => {
                this._viewer.setCompartmentVisible(id, false);
            });
        } else if (this._loadedVolumes.length === 0) {
            displayCompartments.map(v => {
                if (this._knownVolumes.has(v.compartment.id)) {
                    this._viewer.setCompartmentVisible(v.compartment.id, true);
                } else {
                    let geometryColor = v.compartment.geometryColor;
                    if (v.compartment.structureId === ROOT_ID) {
                        geometryColor = UserPreferences.Instance.RootCompartmentColor;
                    }

                    const geometryFile = `${meshPath}${v.compartment.structureId}.obj`;

                    this._viewer.loadCompartment(v.compartment.id, geometryFile, geometryColor);
                    this._knownVolumes.add(v.compartment.id);
                }
            });
        } else {
            const compartmentsToDisplayIds = displayCompartments.map(c => c.compartment.id);

            const unChanged = _.intersection(this._loadedVolumes, compartmentsToDisplayIds);

            const toUnload = _.difference(this._loadedVolumes, unChanged);

            const toLoad = _.difference(compartmentsToDisplayIds, unChanged);

            toUnload.map(id => {
                // const brainArea = this.lookupBrainArea(v);
                // this._viewer.unloadCompartment(brainArea.geometryFile)
                this._viewer.setCompartmentVisible(id, false);
            });

            toLoad.map(id => {
                if (this._knownVolumes.has(id)) {
                    this._viewer.setCompartmentVisible(id, true);
                } else {
                    const brainArea = this.lookupBrainArea(id);
                    if (brainArea.structureId === ROOT_ID) {
                        brainArea.geometryColor = UserPreferences.Instance.RootCompartmentColor;
                    }

                    const geometryFile = `${meshPath}${brainArea.structureId}.obj`;

                    this._viewer.loadCompartment(id, geometryFile, brainArea.geometryColor);
                    this._knownVolumes.add(id);
                }
            });
        }

        this._loadedVolumes = displayCompartments.map(c => c.compartment.id);
    }

    private createNeuron(tracing: TracingViewModel, fadedOpacity: number) {
        const nodes: any = {};

        if (tracing.IsSomaOnly) {
            const node = tracing.soma;

            // Can happen before data is loaded.
            if (!node) {
                return;
            }

            nodes[node.sampleNumber] = {
                alpha: 1.0,
                sampleNumber: node.sampleNumber,
                type: 0,
                x: node.x,
                y: node.y,
                z: node.z,
                radius: Math.min(40, node.radius * 40) * this._tracingRadiusFactor,
                parent: node.parentNumber
            };
        } else {
            // Can happen during transition from soma view mode to tracing, before data is loaded.
            if (!tracing.tracing) {
                return;
            }

            let mapNodes = false;

            if (!tracing.nodeLookup) {
                tracing.nodeLookup = new Map<number, ITracingNode>();
                mapNodes = true;
            }

            tracing.tracing.nodes.forEach(node => {
                if (node) {
                    nodes[node.sampleNumber] = {
                        sampleNumber: node.sampleNumber,
                        type: 0,
                        x: node.x,
                        y: node.y,
                        z: node.z,
                        radius: 4 * this._tracingRadiusFactor,
                        parent: node.parentNumber
                    };

                    if (mapNodes) {
                        tracing.nodeLookup.set(node.sampleNumber, node);
                    }
                }
            });
        }

        this._neuronColors.set(tracing.id, tracing.neuron.baseColor);

        let color = Color(tracing.neuron.baseColor);

        if (tracing.structure.value === TracingStructure.dendrite) {
            color = color.darken(0.25);
        }

        this._viewer.loadNeuron(tracing.id, color.hex(), nodes);

        this.setOpacity(tracing, fadedOpacity);

        this._knownNeurons.add(tracing.id);
    }

    private verifyNeuron(tracing: TracingViewModel, fadedOpacity: number) {
        const matches = this._neuronColors.get(tracing.id) === tracing.neuron.baseColor;

        if (matches) {
            this.setOpacity(tracing, fadedOpacity);
            this._viewer.setNeuronMirror(tracing.id, tracing.neuron.mirror);
        } else {
            this._viewer.unloadNeuron(tracing.id);
            this._knownNeurons.delete(tracing.id);
            this.createNeuron(tracing, fadedOpacity);
        }

        return matches;
    }

    private setOpacity(tracing: TracingViewModel, fadedOpacity: number) {
        if (this.props.highlightSelectionMode === HighlightSelectionMode.Normal) {
            this._viewer.setNeuronDisplayLevel(tracing.id, !this.props.displayHighlightedOnly || tracing.IsHighlighted ? 1.0 : fadedOpacity);
        } else {
            if (tracing.NeuronId === this.props.cycleFocusNeuronId) {
                this._viewer.setNeuronDisplayLevel(tracing.id, 1.0);
            } else {
                this._viewer.setNeuronDisplayLevel(tracing.id, tracing.IsHighlighted ? 0.1 : fadedOpacity);
            }
        }
    }

    private renderNeurons(tracings: TracingViewModel[]) {
        if (tracings === null || this._viewer === null) {
            return; // AppLoading, not ready, etc.  Don't change current appearance.
        }

        if (tracings.length === 0) {
            this._loadedNeurons.map(id => {
                this._viewer.setNeuronVisible(id, false);
            });
            this._loadedNeurons = [];

            return;
        }

        const highlightValue = UserPreferences.Instance.TracingSelectionHiddenOpacity;

        const knownAsArray = Array.from(this._knownNeurons);

        // On screen, but should not be.
        const toHide = _.differenceWith(this._loadedNeurons, tracings, (id, tracing) => id === tracing.id);

        // Never seen and must upload and show
        const toCreate = _.differenceWith(tracings, knownAsArray, (tracing, id) => id === tracing.id);

        // Known, but may have changed.
        const toVerify = _.intersectionWith(tracings, knownAsArray, (tracing, id) => id === tracing.id);

        toVerify.map(obj => {
            this.verifyNeuron(obj, highlightValue);
        });

        toCreate.map(obj => {
            this.createNeuron(obj, highlightValue);
        });

        toHide.map(id => {
            this._viewer.setNeuronVisible(id, false);
        });

        this._loadedNeurons = tracings.map(t => t.id);
    }

    private prepareAndRenderTracings(props: ITracingViewerProps) {
        if (!this.props.isRendering) {
            this.props.onChangeIsRendering(true);
        }

        // Allows the above change in props to be reflected in the UI before performing render.
        setTimeout(() => this.loadTracings(props), 0.01);
    }

    private async loadTracings(props: ITracingViewerProps) {
        const {width, height} = this.calculateDimensions();

        if (UserPreferences.Instance.ViewerStyle == ViewerStyle.Default) {
            await this.createSharkViewer(width, height);
        }

        this.renderCompartments(props);

        this.renderNeurons(props.tracings);

        this.props.onChangeIsRendering(false);
    }

    private onRemoveActiveTracing(neuron: NeuronViewModel) {
        this.props.onHighlightTracing(neuron, false);
    }

    private onSelectNode(tracingId: string, sampleNumber: number, event) {
        if (!this.props.tracings) {
            return;
        }

        const tracings = this.props.tracings.filter(t => t.id == tracingId);

        if (tracings.length > 0) {
            const tracing = tracings[0];

            let node = null;

            if (tracing.nodeLookup) {
                node = tracing.nodeLookup.get(sampleNumber);
            } else {
                // Only the soma has been loaded.
                node = tracing.soma;
            }

            if (!event.ctrlKey && !event.altKey) {
                if (!event.shiftKey) {
                    if (node) {
                        this.setState({selectedTracing: tracing, selectedNode: node});

                        if (this.props.onSelectNode) {
                            this.props.onSelectNode(tracing, node);
                        }
                    }
                } else {
                    this.props.onHighlightTracing(tracing.neuron);
                }
            }
        }
    }

    public render() {
        const activeNeurons = _.uniqBy(this.props.tracings.map(t => t.neuron).filter(n => n.isInHighlightList), "IdOrDoi");

        const style = Object.assign({
            height: "100%",
            width: "100%",
            position: relative
        }, UserPreferences.Instance.HideCursorInViewer ? {cursor: "none"} : {});

        let viewerContainer = null;

        if (UserPreferences.Instance.ViewerStyle == ViewerStyle.Neuroglancer) {
            viewerContainer = <NeuroglancerContainer elementName="neuroglancer-viewer-container" height={this.state.renderHeight} width={this.state.renderWidth} skeletonSegmentIds={this.props.skeletonSegmentIds} compartments={this.props.compartments}/>
        } else {
            viewerContainer = <div id="viewer-container" style={{height: this.state.renderHeight, width: this.state.renderWidth}}/>
        }

        return (
            <div id="viewer-parent" style={style}>
                <ViewerSelection constants={this.props.constants}
                                 selectedNode={this.state.selectedNode}
                                 selectedTracing={this.state.selectedTracing}
                                 displayHighlightedOnly={this.props.displayHighlightedOnly}
                                 highlightSelectionMode={this.props.highlightSelectionMode}
                                 cycleFocusNeuronId={this.props.cycleFocusNeuronId}
                                 activeNeurons={activeNeurons}
                                 onChangeNeuronViewMode={this.props.onChangeNeuronViewMode}
                                 onRemoveActiveTracing={(n) => this.onRemoveActiveTracing(n)}
                                 onToggleTracing={this.props.onToggleTracing}
                                 onToggleLimitToHighlighted={() => this.onToggleDisplayHighlighted()}
                                 onToggleLoadedGeometry={this.props.onToggleCompartment}
                                 onChangeHighlightMode={() => this.props.onChangeHighlightMode()}
                                 onSetHighlightedNeuron={(n: NeuronViewModel) => this.props.onSetHighlightedNeuron(n)}
                                 onCycleHighlightNeuron={(d: number) => this.props.onCycleHighlightNeuron(d)}
                                 populateCustomPredicate={this.props.populateCustomPredicate}/>
                {viewerContainer}
                <div id="axis-viewer-container" style={{
                    height: this._axisViewer?.HEIGHT ?? 0,
                    width: this._axisViewer?.WIDTH ?? 0,
                    position: "absolute",
                    top: 0,
                    left: 0
                }}/>
            </div>
        );
    }

    private setSliceVisible = async (plane: SlicePlane, visible: boolean) => {
        if (!this._sliceManager) {
            return;
        }

        if (visible) {
            await this._sliceManager.showSlice(plane);
        } else {
            this._sliceManager.hideSlice(plane);
        }
    };
}

const relative: "relative" = "relative";
