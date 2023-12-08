import * as React from "react";

import {INeuron} from "../../models/neuron";
import {NdbConstants} from "../../models/constants";
import {FilterComposition, IPositionInput} from "../../models/queryFilter";
import {QueryFilterContainer} from "../query/QueryFilterContainer";
import {MainView} from "../output/MainView";
import {QueryStatus} from "../query/QueryHeader";
import {VisibleBrainAreas} from "../../viewmodel/VisibleBrainAreas";
import {BrainCompartmentViewModel} from "../../viewmodel/brainCompartmentViewModel";
import {ApolloError} from "apollo-client";
import {UIQueryPredicate, UIQueryPredicates} from "../../models/uiQueryPredicate";
import {BRAIN_AREA_FILTER_TYPE_SPHERE} from "../../models/brainAreaFilterType";
import {PreferencesManager} from "../../util/preferencesManager";

interface IPageProps {
    constants: NdbConstants;
    predicates: UIQueryPredicates;
    predicateList: UIQueryPredicate[];
    isInQuery: boolean;
    queryError: ApolloError;
    queryTime: number;
    queryNonce: string;
    totalCount: number;
    neurons: INeuron[];
    shouldAlwaysShowFullTracing: boolean;
    shouldAlwaysShowSoma: boolean;
    isPublicRelease: boolean;
    exportLimit: number;

    onPerformQuery(): void;
    onResetPage(): void;
}

interface IPageState {
    isQueryCollapsed?: boolean;
    visibleBrainAreas?: BrainCompartmentViewModel[];
}

export class QueryPage extends React.Component<IPageProps, IPageState> {
    private _visibleBrainAreas = new VisibleBrainAreas();

    private _mainView;

    public constructor(props: IPageProps) {
        super(props);

        this._visibleBrainAreas.initialize(props.constants);

        this.state = {
            isQueryCollapsed: false,
            visibleBrainAreas: this._visibleBrainAreas.BrainAreas
        };
    }

    private onPerformQuery = () => {
        if (this.state.isQueryCollapsed && !PreferencesManager.Instance.ShouldAutoCollapseOnQuery) {
            this.setState({isQueryCollapsed: !this.state.isQueryCollapsed});
        }

        this.props.onPerformQuery();
    };

    public resetView(r1: number, r2: number) {
        this._mainView.ViewerContainer.TracingViewer.resetView(r1, r2);
    }

    public updateVisibleCompartments(ids: number[]) {
        this._visibleBrainAreas.show(ids);

        this.setState({visibleBrainAreas: this._visibleBrainAreas.BrainAreas});
    }

    private onResetPage = () => {
        this.props.onResetPage();

        this._visibleBrainAreas.clear();
        this._mainView.resetPage();

        this.setState({visibleBrainAreas: this._visibleBrainAreas.BrainAreas, isQueryCollapsed: false});
    };

    private populateCustomPredicate?(position: IPositionInput, replace: boolean) {
        this.setState({isQueryCollapsed: false});

        if (replace) {
            const filter = this.props.predicateList[this.props.predicateList.length - 1];
            filter.brainAreaFilterType = BRAIN_AREA_FILTER_TYPE_SPHERE;
            filter.filter.arbCenter = {
                x: position.x.toFixed(1),
                y: position.y.toFixed(1),
                z: position.z.toFixed(1)
            };
            this.props.predicates.replacePredicate(filter);
        } else {
            this.props.predicates.addPredicate({
                brainAreaFilterType: BRAIN_AREA_FILTER_TYPE_SPHERE
            }, {
                composition: FilterComposition.and,
                arbCenter: {
                    x: position.x.toFixed(1),
                    y: position.y.toFixed(1),
                    z: position.z.toFixed(1)
                }
            });
        }
    }

    private onToggleBrainArea(id: string) {
        this._visibleBrainAreas.toggle(id);
        this.setState({visibleBrainAreas: this._visibleBrainAreas.BrainAreas});
    }

    private onRemoveBrainAreaFromHistory(viewModel: BrainCompartmentViewModel) {
        viewModel.shouldIncludeInHistory = false;
        this.setState({visibleBrainAreas: this._visibleBrainAreas.BrainAreas});
    }

    private onMutateBrainAreas(added: string[], removed: string[]) {
        this._visibleBrainAreas.mutate(added, removed);
        this.setState({visibleBrainAreas: this._visibleBrainAreas.BrainAreas});
    }

    public render() {
        const queryStatus = this.props.isInQuery ? QueryStatus.Loading : (this.props.totalCount >= 0 ? QueryStatus.Loaded : QueryStatus.NeverQueried);

        const queryProps: any = {
            constants: this.props.constants,
            predicates: this.props.predicates,
            predicateList: this.props.predicateList,
            isCollapsed: this.state.isQueryCollapsed,
            status: queryStatus,
            neuronSystemCount: this.props.totalCount,
            neuronMatchCount: this.props.neurons.length,
            queryDuration: this.props.queryTime,
            onPerformQuery: this.onPerformQuery,
            onResetPage: this.onResetPage,
            onToggleCollapsed: () => this.setState({isQueryCollapsed: !this.state.isQueryCollapsed}),
        };

        const viewerProps = {
            constants: this.props.constants,
            isQueryCollapsed: this.state.isQueryCollapsed,
            queryStatus: queryStatus,
            neurons: this.props.neurons,
            visibleBrainAreas: this.state.visibleBrainAreas,
            isLoading: this.props.isInQuery,
            nonce: this.props.queryNonce,
            shouldAlwaysShowFullTracing: this.props.shouldAlwaysShowFullTracing,
            shouldAlwaysShowSoma: this.props.shouldAlwaysShowSoma,
            isPublicRelease: this.props.isPublicRelease,
            exportLimit: this.props.exportLimit,
            compartmentMeshVersion: PreferencesManager.Instance.ViewerMeshVersion,
            ref: (r) => this._mainView = r,
            onToggleQueryCollapsed: () => this.setState({isQueryCollapsed: !this.state.isQueryCollapsed}),
            populateCustomPredicate: (p: IPositionInput, b: boolean) => this.populateCustomPredicate(p, b),
            onToggleBrainArea: (id: string) => this.onToggleBrainArea(id),
            onRemoveBrainAreaFromHistory: (id: BrainCompartmentViewModel) => this.onRemoveBrainAreaFromHistory(id),
            onMutateBrainAreas: (added: string[], removed: string[]) => this.onMutateBrainAreas(added, removed)
        };

        return (
            <div style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                flexWrap: "nowrap",
                alignItems: "flex-start",
                alignContent: "flex-start"
            }}>
                <div style={{width: "100%", order: 1, flexBasis: "auto", overflow: "auto"}}>
                    <QueryFilterContainer {...queryProps}/>
                </div>
                <div style={{height: "100px", width: "100%", flexGrow: 1, flexShrink: 1, order: 2}}>
                    <MainView{...viewerProps}/>
                </div>
            </div>
        );
    }
}
