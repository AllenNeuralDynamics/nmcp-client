import * as React from "react";
import * as _ from "lodash-es";

import {ExportFormat, ITracing} from "../../models/tracing";
import {HighlightSelectionMode} from "./TracingViewer";

import "../../util/override.css";
import {INeuron} from "../../models/neuron";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {jet} from "../../util/colors";
import {NEURON_VIEW_MODE_SOMA, NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {TracingStructure, TracingStructures} from "../../models/tracingStructure";
import {BrainCompartmentViewModel} from "../../viewmodel/brainCompartmentViewModel";
import {NdbConstants} from "../../models/constants";
import {IPositionInput} from "../../models/queryFilter";
import {NeuronListContainer} from "./NeuronListContainer";
import {ViewerContainer} from "./ViewerContainer";
import {CompartmentListContainer} from "./compartments/CompartmentListContainer";
import {fullRowStyle} from "../../util/styles";
import {QueryStatus} from "../query/QueryHeader";
import {IBrainArea} from "../../models/brainArea";
import {CompartmentNode} from "./compartments/CompartmentNode";
import {Button, Message, Modal} from "semantic-ui-react";
import {ViewerMeshVersion} from "../../models/compartmentMeshSet";
import {ViewerStyle} from "../../viewer/viewerStyle";
import {UserPreferences} from "../../util/userPreferences";

const neuronViewModelMap = new Map<string, NeuronViewModel>();

const tracingNeuronMap = new Map<string, string>();

const tracingViewModelMap2 = new Map<string, TracingViewModel>();

export enum DrawerState {
    Hidden,
    Float,
    Dock
}

export enum FetchState {
    Running = 1,
    Paused
}

interface FetchCalc {
    knownTracings: TracingViewModel[];
    hadQuery: boolean;
}

interface NeuronCalc {
    neurons: NeuronViewModel[];
    fetchCalc: FetchCalc;
}

interface IOutputContainerProps {
    isQueryCollapsed: boolean;
    queryStatus: QueryStatus;
    isLoading: boolean;
    neurons: INeuron[];
    visibleBrainAreas: BrainCompartmentViewModel[];
    constants: NdbConstants;
    nonce: string;
    shouldAlwaysShowFullTracing: boolean;
    shouldAlwaysShowSoma: boolean;
    exportLimit: number;
    compartmentMeshVersion?: ViewerMeshVersion;

    requestExport?(tracingIds: string[], format: ExportFormat): any;

    populateCustomPredicate?(position: IPositionInput, replace: boolean): void;

    onToggleBrainArea(id: string): void;

    onRemoveBrainAreaFromHistory(viewModel: BrainCompartmentViewModel): void;

    onMutateBrainAreas(added: string[], removed: string[]): void;

    onToggleQueryCollapsed(): void;
}

interface IOutputContainerState {
    defaultStructureSelection?: NeuronViewMode;
    neuronViewModels?: NeuronViewModel[];
    tracingsToDisplay?: TracingViewModel[];
    rootNode?: CompartmentNode;
    displayHighlightedOnly?: boolean;
    wasDisplayHighlightedOnly?: boolean;
    cycleFocusNeuronId?: string;
    highlightSelectionMode?: HighlightSelectionMode;
    fetchState?: FetchState;
    fetchCount?: number;
    isRendering?: boolean;
    isNeuronListOpen?: boolean;
    isNeuronListDocked?: boolean;
    isCompartmentListOpen?: boolean;
    isCompartmentListDocked?: boolean;
    isExportMessageOpen?: boolean;
}

export class MainView extends React.Component<IOutputContainerProps, IOutputContainerState> {
    private _queuedIds: string[] = [];
    private _isInQuery: boolean = false;
    private _colorIndex: number = 0;
    private _fetchBatchSize = UserPreferences.Instance.TracingFetchBatchSize;

    private _viewerContainer = null;
    private _expectingFetch = false;

    public constructor(props: IOutputContainerProps) {
        super(props);

        const neuronCalc = this.updateNeuronViewModels(props, false);

        this.state = {
            defaultStructureSelection: NEURON_VIEW_MODE_SOMA,
            neuronViewModels: neuronCalc.neurons,
            tracingsToDisplay: [],
            rootNode: makeCompartmentNodes(props.constants.BrainAreasWithGeometry),
            displayHighlightedOnly: false,
            highlightSelectionMode: HighlightSelectionMode.Normal,
            fetchState: FetchState.Running,
            fetchCount: 0,
            cycleFocusNeuronId: null,
            isRendering: false,
            isNeuronListOpen: false,
            isNeuronListDocked: UserPreferences.Instance.IsNeuronListDocked,
            isCompartmentListDocked: UserPreferences.Instance.IsCompartmentListDocked,
            isExportMessageOpen: false
        };
    }

    public get ViewerContainer() {
        return this._viewerContainer;
    }

    private onSetFetchState(fetchState: FetchState) {
        this.setState({fetchState}, () => this.fetchTracings());
    }

    public onCancelFetch() {
        this._queuedIds = [];

        const neuronViewModels = this.state.neuronViewModels.map(n => {
            n.cancelRequestedViewMode();
            return n;
        });

        this.updateNeuronViewModels(this.props, true);

        this.setState({fetchState: FetchState.Running, fetchCount: 0, neuronViewModels: neuronViewModels.slice()});
    }

    private completeFetch() {
        this._expectingFetch = false;
    }

    public resetPage() {
        this._colorIndex = 0;
        // Must do before cancelFetch which will update state for this property.
        Array.from(neuronViewModelMap.values()).map(n => {
            n.isSelected = n.isSelected || this.props.shouldAlwaysShowSoma
        });
        this.onCancelFetch();
        this.ViewerContainer.TracingViewer.reset();
        this.setState({displayHighlightedOnly: false, highlightSelectionMode: HighlightSelectionMode.Normal});
    }

    private neuronIdsForExport(): string[] {
        const neurons = this.state.neuronViewModels.filter(v => v.isSelected);

        return neurons.map(n => n.neuron.id);
    }

    private onNeuronListCloseOrPin(state: DrawerState) {
        if (state === DrawerState.Hidden) {
            // Close the docked or drawer
            UserPreferences.Instance.IsNeuronListDocked = false;
            this.setState({isNeuronListDocked: false, isNeuronListOpen: false});
        } else if (state === DrawerState.Float) {
            // Pin the float
            UserPreferences.Instance.IsNeuronListDocked = false;
            this.setState({isNeuronListDocked: false, isNeuronListOpen: true});
        } else {
            UserPreferences.Instance.IsNeuronListDocked = true;
            this.setState({isNeuronListDocked: true, isNeuronListOpen: false});
        }
    }

    private onCompartmentListCloseOrPin(state: DrawerState) {
        if (state === DrawerState.Hidden) {
            // Close the docked or drawer
            UserPreferences.Instance.IsCompartmentListDocked = false;
            this.setState({isCompartmentListDocked: false, isCompartmentListOpen: false});
        } else if (state === DrawerState.Float) {
            // Pin the float
            UserPreferences.Instance.IsCompartmentListDocked = false;
            this.setState({isCompartmentListDocked: false, isCompartmentListOpen: true});
        } else {
            UserPreferences.Instance.IsCompartmentListDocked = true;
            this.setState({isCompartmentListDocked: true, isCompartmentListOpen: false});
        }
    }

    private async onExportSelectedTracings(format: ExportFormat) {
        try {
            const ids = this.neuronIdsForExport();

            if (ids.length === 0) {
                return;
            }

            fetch("/export", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ids,
                    format
                })
            }).then(async (response) => {
                if (response.status !== 200) {
                    this.setState({isExportMessageOpen: true});
                    return;
                }
                const data: any = await response.json();

                let contents = data.contents;

                let mime = "text/plain;charset=utf-8";

                if (format === ExportFormat.SWC) {
                    contents = dataToBlob(contents);

                    if (ids.length > 1) {
                        mime = "application/zip";
                    }
                } else {
                    contents = JSON.stringify(contents, null, 2);
                }


                saveFile(contents, `${data.filename}`, mime);
            }).catch((err) => {
                console.log(err)
            });
        } catch (error) {
            console.log(error);
        }
    }

    private onShowNeuronList() {
        this.setState({isNeuronListOpen: true});
    }

    private onToggleDisplayHighlighted() {
        this.setState({displayHighlightedOnly: !this.state.displayHighlightedOnly});
    }

    private onChangeHighlightMode() {
        let nextHighlightMode = this.state.highlightSelectionMode === HighlightSelectionMode.Normal ? HighlightSelectionMode.Cycle : HighlightSelectionMode.Normal;

        let displayHighlightedOnly = this.state.displayHighlightedOnly;

        let cycleFocusNeuronId = null;

        if (nextHighlightMode === HighlightSelectionMode.Cycle) {
            const active = this.state.neuronViewModels.find(n => n.isInHighlightList);

            if (active) {
                cycleFocusNeuronId = active.neuron.id;
            }

            displayHighlightedOnly = true;
        } else {
            displayHighlightedOnly = this.state.wasDisplayHighlightedOnly;
            cycleFocusNeuronId = null;
        }

        this.setState({
            displayHighlightedOnly,
            highlightSelectionMode: nextHighlightMode,
            wasDisplayHighlightedOnly: this.state.displayHighlightedOnly,
            cycleFocusNeuronId
        });
    }

    private onChangeHighlightTracing(neuronViewModel: NeuronViewModel, shouldHighlight: boolean = null) {
        neuronViewModel.isInHighlightList = shouldHighlight == null ? !neuronViewModel.isInHighlightList : shouldHighlight;

        const tracingsToDisplay = this.state.tracingsToDisplay.slice();

        this.setState({tracingsToDisplay});

        this.verifyHighlighting();
    }

    private onChangeSelectTracing(id: string, shouldSelect: boolean) {
        const neuronViewModels = this.state.neuronViewModels.slice();

        neuronViewModelMap.get(id).isSelected = shouldSelect;

        const fetchCalc = this.determineTracingFetchState(neuronViewModels);

        this.setState({neuronViewModels, tracingsToDisplay: fetchCalc.knownTracings});
    }

    private onChangeSelectAllTracings(shouldSelectAll: boolean) {
        const neuronViewModels = this.state.neuronViewModels.slice();

        neuronViewModelMap.forEach(v => v.isSelected = shouldSelectAll);

        const fetchCalc = this.determineTracingFetchState(neuronViewModels);

        this.setState({neuronViewModels, tracingsToDisplay: fetchCalc.knownTracings});
    }

    private onChangeNeuronColor(neuron: NeuronViewModel, color: any) {
        const neuronViewModels = this.state.neuronViewModels.slice();

        neuron.baseColor = color.hex;

        this.setState({neuronViewModels});
    }

    private onChangeNeuronMirror(neuron: NeuronViewModel, mirror: boolean) {
        const neuronViewModels = this.state.neuronViewModels.slice();

        neuron.mirror = mirror;

        this.setState({neuronViewModels});
    }

    private onChangeDefaultStructure(mode: NeuronViewMode) {
        this.setState({defaultStructureSelection: mode});

        this.state.neuronViewModels.map(v => v.requestViewMode(mode.structure));

        const fetchCalc = this.determineTracingFetchState(this.state.neuronViewModels.slice());

        this.setState({tracingsToDisplay: fetchCalc.knownTracings});
    }


    private onChangeIsRendering(isRendering: boolean) {
        if (isRendering !== this.state.isRendering) {
            this.setState({isRendering});
        }
    }

    private onChangeNeuronViewMode(neuronViewModel: NeuronViewModel, viewMode: NeuronViewMode) {
        neuronViewModel.requestViewMode(viewMode.structure);

        if (viewMode.structure !== TracingStructure.soma) {
            neuronViewModel.toggleViewMode = viewMode;
        }

        this.updateNeuronViewModels(this.props, true);

        this.verifyHighlighting();
    }

    private onToggleSomaViewMode(neuronViewModel: NeuronViewModel) {
        if (neuronViewModel.ViewMode.structure !== TracingStructure.soma) {
            neuronViewModel.toggleViewMode = neuronViewModel.ViewMode;
            neuronViewModel.requestViewMode(TracingStructure.soma);
        } else {
            neuronViewModel.requestViewMode(neuronViewModel.toggleViewMode.structure);
        }

        this.updateNeuronViewModels(this.props, true);

        this.verifyHighlighting();
    }

    private onToggleTracing(id: string) {
        const tracing = tracingViewModelMap2.get(id);

        this.onToggleSomaViewMode(tracing.neuron);
    }

    private onSetHighlightedNeuron(neuron: NeuronViewModel) {
        this.setState({cycleFocusNeuronId: neuron.Id});
    }

    private onCycleHighlightNeuron(direction: number) {
        const highlighted = this.state.neuronViewModels.filter(n => n.isInHighlightList).map(n => n.neuron.id);

        if (highlighted.length < 2) {
            return;
        }

        if (this.state.cycleFocusNeuronId === null) {
            if (highlighted.length > 0) {
                this.setState({cycleFocusNeuronId: highlighted[0]});
            }
        } else {
            const index = highlighted.indexOf(this.state.cycleFocusNeuronId);

            if (direction < 0) {
                if (index > 0) {
                    this.setState({cycleFocusNeuronId: highlighted[index - 1]});
                } else {
                    this.setState({cycleFocusNeuronId: highlighted[length - 1]});
                }
            } else {
                if (index < highlighted.length - 1) {
                    this.setState({cycleFocusNeuronId: highlighted[index + 1]});
                } else {
                    this.setState({cycleFocusNeuronId: highlighted[0]});
                }
            }
        }
    }

    private verifyHighlighting() {
        if (this.state.highlightSelectionMode === HighlightSelectionMode.Cycle) {
            const highlighted = this.state.neuronViewModels.filter(n => n.isInHighlightList).map(n => n.neuron.id);

            if (this.state.cycleFocusNeuronId === null || !highlighted.some(id => id === this.state.cycleFocusNeuronId)) {
                if (highlighted.length > 0) {
                    this.setState({cycleFocusNeuronId: highlighted[0]});
                } else {
                    this.setState({highlightSelectionMode: HighlightSelectionMode.Normal});
                }
            }
        }
    }

    public componentWillReceiveProps(props: IOutputContainerProps) {
        if (props.queryStatus === QueryStatus.Loading) {
            this._colorIndex = 0;
            this._expectingFetch = true;

            this.onCancelFetch();

            return;
        }

        const neuronCalc = this.updateNeuronViewModels(props, true);

        this.verifyHighlighting();

        if (this._expectingFetch && !neuronCalc.fetchCalc.hadQuery) {
            this.completeFetch();
        }
    }

    private updateNeuronViewModels(props: IOutputContainerProps, setState: boolean): NeuronCalc {
        let loadedModels: NeuronViewModel[] = [];

        props.neurons.filter(n => n != null).map((neuron, index) => {
            let viewModel = neuronViewModelMap.get(neuron.id);

            if (!viewModel) {
                const color = jet[this._colorIndex++ % jet.length];

                viewModel = new NeuronViewModel(neuron, color);

                neuronViewModelMap.set(neuron.id, viewModel);

                neuron.tracings.map(t => {
                    tracingNeuronMap.set(t.id, neuron.id);

                    const model = new TracingViewModel(t.id, viewModel);

                    model.soma = t.soma;
                    model.structure = t.tracingStructure;

                    tracingViewModelMap2.set(t.id, model);

                    viewModel.tracings.push(model);

                    if (t.tracingStructure.value === TracingStructure.axon) {
                        viewModel.hasAxonTracing = true;
                    }

                    if (t.tracingStructure.value === TracingStructure.dendrite) {
                        viewModel.hasDendriteTracing = true;
                    }
                });

                if (neuron.tracings.length > 0) {
                    const somaTracingModel = new TracingViewModel(neuron.id, viewModel);

                    // Borrow soma data from one of the tracings.
                    somaTracingModel.soma = viewModel.neuron.tracings[0].soma;

                    somaTracingModel.structure = TracingStructures.Soma;

                    viewModel.somaOnlyTracing = somaTracingModel;

                    // Store under the neuron id.
                    tracingViewModelMap2.set(neuron.id, somaTracingModel);
                }

                if (this.props.shouldAlwaysShowFullTracing) {
                    viewModel.requestViewMode(TracingStructure.all);
                    viewModel.isSelected = true;
                } else if (this.props.shouldAlwaysShowSoma) {
                    viewModel.requestViewMode(TracingStructure.soma);
                    viewModel.isSelected = true;
                } else {
                    viewModel.requestViewMode(this.state.defaultStructureSelection.structure);
                    viewModel.isSelected = false;
                }
            }

            loadedModels.push(viewModel);
        });

        const fetchCalc = this.determineTracingFetchState(loadedModels);

        if (setState) {
            this.setState({neuronViewModels: loadedModels, tracingsToDisplay: fetchCalc.knownTracings});
        }

        return {
            neurons: loadedModels,
            fetchCalc
        };
    }

    private determineTracingFetchState(knownViewModels: NeuronViewModel[]): FetchCalc {
        let tracingsToDisplay: TracingViewModel[] = null;

        let hadQuery = false;

        const neuronsToDisplay = knownViewModels.filter(v => v.isSelected);

        if (neuronsToDisplay.length > 0) {
            const ids = neuronsToDisplay.reduce((prev, n) => {
                const viewMode = n.ViewMode.structure;

                prev.full = prev.full.concat(n.neuron.tracings.filter(t => {
                    switch (viewMode) {
                        case TracingStructure.all:
                            return true;
                        case TracingStructure.axon:
                            return t.tracingStructure.value == TracingStructure.axon;
                        case TracingStructure.dendrite:
                            return t.tracingStructure.value == TracingStructure.dendrite;
                        default:
                            return false; // soma handled separately - no fetch required.
                    }
                }).map(t => t.id));

                if (viewMode === TracingStructure.soma) {
                    if (n.somaOnlyTracing) {
                        prev.soma.push(n.neuron.id);
                        n.requestViewMode(TracingStructure.soma);
                    }
                }

                return prev;
            }, {full: [], soma: []});

            const availableFullIds = Array.from(tracingViewModelMap2.values()).filter(t => t.tracing !== null).map(t => t.id);

            const known = _.intersection(ids.full, availableFullIds);

            const toQuery = _.difference(ids.full, known);

            tracingsToDisplay = known.map(id => {
                const neuronModel = neuronViewModelMap.get(tracingNeuronMap.get(id));

                if (neuronModel) {
                    neuronModel.completedViewModeRequest();
                }

                return tracingViewModelMap2.get(id);
            });

            tracingsToDisplay = tracingsToDisplay.concat(ids.soma.map(id => tracingViewModelMap2.get(id)));

            if (toQuery.length > 0) {
                hadQuery = true;
                this.queueTracings(toQuery);
            }
        } else {
            tracingsToDisplay = [];
        }

        return {
            knownTracings: tracingsToDisplay,
            hadQuery
        };
    }

    private queueTracings(ids: string[]) {
        this._queuedIds = _.uniq(this._queuedIds.concat(ids));

        this.fetchTracings();
    }

    private fetchTracings() {
        if (this._isInQuery || this._queuedIds.length === 0 || this.state.fetchState !== FetchState.Running) {
            return;
        }

        const ids = this._queuedIds.splice(0, this._fetchBatchSize);

        this._isInQuery = true;

        this.setState({fetchCount: this._queuedIds.length});

        fetch('/tracings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ids
            })
        }).then(async (data) => {
            if (data.status === 200) {
                const arrive = Date.now();

                const tracingsData = await data.json();

                const tracings = tracingsData.tracings;

                let tracingsToDisplay = this.state.tracingsToDisplay;

                tracings.forEach((t: ITracing) => {
                    const model = tracingViewModelMap2.get(t.id);
                    model.tracing = t;
                    tracingsToDisplay.push(model);

                    const neuronModel = neuronViewModelMap.get(tracingNeuronMap.get(t.id));

                    if (neuronModel) {
                        neuronModel.completedViewModeRequest();
                    }
                });

                this.setState({fetchCount: this._queuedIds.length, tracingsToDisplay});

                this._isInQuery = false;
            } else {
                console.log(data);

                ids.forEach(id => {
                    const v = neuronViewModelMap.get(tracingNeuronMap.get(id));
                    v.isSelected = false;
                    v.cancelRequestedViewMode();
                });

                this.setState({
                    neuronViewModels: this.state.neuronViewModels.slice(),
                    fetchCount: this._queuedIds.length
                });

                this._isInQuery = false;
            }

            if (this._queuedIds.length === 0) {
                this.completeFetch();
            }

            setTimeout(() => this.fetchTracings(), 0);
        }).catch((err) => {
            ids.forEach(id => {
                const v = neuronViewModelMap.get(tracingNeuronMap.get(id));
                v.cancelRequestedViewMode();
                v.isSelected = false;
            });

            this.setState({
                neuronViewModels: this.state.neuronViewModels.slice(),
                fetchCount: this._queuedIds.length
            });

            console.log(err);

            this._isInQuery = false;

            setTimeout(() => this.fetchTracings(), 0);
        });
    }

    public render() {
        const isAllTracingsSelected = !this.state.neuronViewModels.some(v => !v.isSelected);

        const tableProps = {
            isDocked: this.state.isNeuronListDocked,
            queryStatus: this.props.queryStatus,
            isAllTracingsSelected,
            defaultStructureSelection: this.state.defaultStructureSelection,
            neuronViewModels: this.state.neuronViewModels,
            exportLimit: this.props.exportLimit,
            onRequestExport: (f) => this.onExportSelectedTracings(f),
            onChangeSelectTracing: (id: string, b: boolean) => this.onChangeSelectTracing(id, b),
            onChangeNeuronColor: (n: NeuronViewModel, c: any) => this.onChangeNeuronColor(n, c),
            onChangeNeuronMirror: (n: NeuronViewModel, b: boolean) => this.onChangeNeuronMirror(n, b),
            onChangeNeuronViewMode: (n: NeuronViewModel, v: NeuronViewMode) => this.onChangeNeuronViewMode(n, v),
            onChangeSelectAllTracings: (b: boolean) => this.onChangeSelectAllTracings(b),
            onChangeDefaultStructure: (mode: NeuronViewMode) => this.onChangeDefaultStructure(mode),
            onClickCloseOrPin: (s: DrawerState) => this.onNeuronListCloseOrPin(s)
        };

        const viewerProps = {
            isNeuronListDocked: this.state.isNeuronListDocked,
            isCompartmentListDocked: this.state.isCompartmentListDocked,
            isNeuronListOpen: this.state.isNeuronListOpen,
            isCompartmentListOpen: this.state.isCompartmentListOpen,
            constants: this.props.constants,
            isLoading: this.props.isLoading,
            tracings: this.state.tracingsToDisplay,
            compartments: this.props.visibleBrainAreas,
            highlightedTracings: [],
            isRendering: this.state.isRendering,
            fetchCount: this.state.fetchCount,
            fixedAspectRatio: null,
            displayHighlightedOnly: this.state.displayHighlightedOnly,
            highlightSelectionMode: this.state.highlightSelectionMode,
            cycleFocusNeuronId: this.state.cycleFocusNeuronId,
            isQueryCollapsed: this.props.isQueryCollapsed,
            fetchState: this.state.fetchState,
            onSetFetchState: (s) => this.onSetFetchState(s),
            onCancelFetch: () => this.onCancelFetch(),
            onChangeNeuronViewMode: (n: NeuronViewModel, v: NeuronViewMode) => this.onChangeNeuronViewMode(n, v),
            onToggleQueryCollapsed: this.props.onToggleQueryCollapsed,
            onChangeIsRendering: (b: boolean) => this.onChangeIsRendering(b),
            onToggleDisplayHighlighted: () => this.onToggleDisplayHighlighted(),
            onHighlightTracing: (n: NeuronViewModel, b: boolean) => this.onChangeHighlightTracing(n, b),
            onToggleTracing: (id: string) => this.onToggleTracing(id),
            onToggleCompartment: this.props.onToggleBrainArea,
            onSetHighlightedNeuron: (n: NeuronViewModel) => this.onSetHighlightedNeuron(n),
            onCycleHighlightNeuron: (d: number) => this.onCycleHighlightNeuron(d),
            onChangeHighlightMode: () => this.onChangeHighlightMode(),
            populateCustomPredicate: (p: IPositionInput, b: boolean) => this.props.populateCustomPredicate(p, b),
            onFloatNeuronList: () => this.onNeuronListCloseOrPin(DrawerState.Float),
            onFloatCompartmentList: () => this.onCompartmentListCloseOrPin(DrawerState.Float)
        };

        const treeProps = {
            isDocked: this.state.isCompartmentListDocked,
            constants: this.props.constants,
            onChangeLoadedGeometry: this.props.onMutateBrainAreas,
            visibleBrainAreas: this.props.visibleBrainAreas,
            rootNode: this.state.rootNode,
            compartmentMeshVersion: this.props.compartmentMeshVersion,
            onToggleCompartmentSelected: this.props.onToggleBrainArea,
            onRemoveFromHistory: this.props.onRemoveBrainAreaFromHistory,
            onClickCloseOrPin: (s: DrawerState) => this.onCompartmentListCloseOrPin(s),

        };

        const is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        // Navbar @ 79, fixed query header @ 40, and if expanded, query area at 300 => 119 or 419
        let offset = this.props.isQueryCollapsed ? 119 : 419;

        if (is_chrome) {
            offset -= 0;
        }

        const baseStyle = {
            position: "fixed" as "fixed",
            zIndex: 200,
            top: offset + "px",
            height: "calc(100% - " + offset + "px)",
            backgroundColor: "#ffffffdd"
        };

        const neuronList = (<NeuronListContainer {...tableProps}/>);

        const neuronListFloat = this.state.isNeuronListOpen ? (<div style={baseStyle}>  {neuronList}</div>) : null;

        let compartmentListFloat = null;
        let compartmentListDock = null;

        if (UserPreferences.Instance.ViewerStyle == ViewerStyle.Default) {
            compartmentListFloat = this.state.isCompartmentListOpen ? (
                <div style={Object.assign({left: "calc(100% - 400px)"}, baseStyle)}>
                    <CompartmentListContainer {...treeProps}/>
                </div>) : null;

            compartmentListDock = this.state.isCompartmentListDocked ? (
                <CompartmentListContainer {...treeProps}/>) : null;
        }

        const overlay = neuronListFloat !== null || compartmentListFloat !== null ? (
            <div style={{
                width: "100%",
                position: "fixed",
                top: offset + "px",
                zIndex: 1,
                height: "calc(100% - " + offset + "px)",
                backgroundColor: "#000000",
                opacity: 0.1
            }} onClick={() => this.setState({isNeuronListOpen: false, isCompartmentListOpen: false})}/>) : null;

        const style = {width: "100%", height: "100%"};

        return (
            <div style={style}>
                <Modal open={this.state.isExportMessageOpen} dimmer="blurring"
                       onClose={() => this.setState({isExportMessageOpen: false})}>
                    <Modal.Header content="Export Failed"/>
                    <Modal.Content>
                        <Message error
                                 content="There was an issue contacting the download server. The tracings were not downloaded."/>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button content="Ok" onClick={() => this.setState({isExportMessageOpen: false})}/>
                    </Modal.Actions>
                </Modal>
                {neuronListFloat}
                {compartmentListFloat}
                {overlay}
                <div style={fullRowStyle}>
                    {this.state.isNeuronListDocked ? neuronList : null}
                    <ViewerContainer {...viewerProps} ref={(v) => this._viewerContainer = v}/>
                    {compartmentListDock}
                </div>
            </div>
        );
    }
}

function saveFile(data: any, filename: string, mime: string = null) {
    const blob = new Blob([data], {type: mime || "text/plain;charset=utf-8"});

    const blobURL = window.URL.createObjectURL(blob);
    const tempLink = document.createElement("a");
    tempLink.href = blobURL;
    tempLink.setAttribute("download", filename);
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
}

function dataToBlob(encoded) {
    const byteString = atob(encoded);

    const ab = new ArrayBuffer(byteString.length);

    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return ab;
}

// A couple of hard-coded exceptions.  If this grows, should have a db column.
const ROOT = 997;
const RETINA = 304325711;
const GROOVES = 1024;

export const compartmentNodeSortedList = new Array<CompartmentNode>();
const compartmentNodeMap = new Map<number, CompartmentNode>();

function makeCompartmentNodes(brainAreas: IBrainArea[]): CompartmentNode {
    if (compartmentNodeMap.size > 0) {
        return compartmentNodeMap.get(ROOT);
    }

    let sorted = brainAreas.slice();

    const root: CompartmentNode = new CompartmentNode();
    root.name = sorted[0].name;
    // root.isChecked = true;
    root.toggled = true;
    root.children = null;
    root.compartment = sorted[0];

    compartmentNodeMap.set(sorted[0].structureId, root);
    compartmentNodeSortedList.push(root);

    sorted = sorted.slice(1);

    sorted.forEach((c: IBrainArea) => {
        if (c.structureId === RETINA || c.structureId === GROOVES) {
            return;
        }

        const node: CompartmentNode = new CompartmentNode();
        node.name = c.name;
        // node.isChecked = false;
        node.toggled = false;
        node.children = null;
        node.compartment = c;

        compartmentNodeMap.set(c.structureId, node);
        compartmentNodeSortedList.push(node);

        const parent = compartmentNodeMap.get(c.parentStructureId);

        if (parent) {
            if (!parent.children) {
                parent.children = [];
            }
            parent.children.push(node);
        }
    });

    return root;
}
