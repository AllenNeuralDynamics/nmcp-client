import * as React from "react";

import {INeuron} from "../../models/neuron";
import {NdbConstants} from "../../models/constants";
import {FilterComposition, IPositionInput} from "../../models/queryFilter";
import {QueryFilterContainer} from "../query/QueryFilterContainer";
import {MainView} from "../output/MainView";
import {QueryStatus} from "../query/QueryHeader";
import {VisibleBrainAreas} from "../../viewmodel/VisibleBrainAreas";
import {BrainCompartmentViewModel} from "../../viewmodel/brainCompartmentViewModel";
import {ApolloError} from "@apollo/client";
import {UIQueryPredicate, UIQueryPredicates} from "../../models/uiQueryPredicate";
import {BRAIN_AREA_FILTER_TYPE_SPHERE} from "../../models/brainAreaFilterType";
import {ViewerMeshVersion} from "../../models/compartmentMeshSet";
import {UserPreferences} from "../../util/userPreferences";

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
    exportLimit: number;

    onPerformQuery(): void;
    onResetPage(): void;
}

export interface QueryPageRef {
    resetView(r1: number, r2: number): void;
    updateVisibleCompartments(ids: number[]): void;
}

export const QueryPage = React.forwardRef<QueryPageRef, IPageProps>((props, ref) => {
    const [isQueryCollapsed, setIsQueryCollapsed] = React.useState<boolean>(false);
    const [visibleBrainAreas, setVisibleBrainAreas] = React.useState<BrainCompartmentViewModel[]>([]);
    
    const visibleBrainAreasRef = React.useRef<VisibleBrainAreas>(new VisibleBrainAreas());
    const mainViewRef = React.useRef<any>(null);

    React.useEffect(() => {
        if (!visibleBrainAreasRef.current) {
            visibleBrainAreasRef.current = new VisibleBrainAreas();
        }
        visibleBrainAreasRef.current.initialize(props.constants);
        setVisibleBrainAreas(visibleBrainAreasRef.current.BrainAreas);
    }, [props.constants]);

    React.useImperativeHandle(ref, () => ({
        resetView: (r1: number, r2: number) => {
            mainViewRef.current?.ViewerContainer.TracingViewer.resetView(r1, r2);
        },
        updateVisibleCompartments: (ids: number[]) => {
            visibleBrainAreasRef.current.show(ids);
            setVisibleBrainAreas(visibleBrainAreasRef.current.BrainAreas);
        }
    }));

    const onPerformQuery = () => {
        if (isQueryCollapsed && !UserPreferences.Instance.ShouldAutoCollapseOnQuery) {
            setIsQueryCollapsed(!isQueryCollapsed);
        }
        props.onPerformQuery();
    };

    const onResetPage = () => {
        props.onResetPage();
        
        visibleBrainAreasRef.current.clear();
        mainViewRef.current?.resetPage();
        
        setVisibleBrainAreas(visibleBrainAreasRef.current.BrainAreas);
        setIsQueryCollapsed(false);
    };

    const onShare = () => {
        const queryData = {
            timestamp: Date.now(),
            filters: props.predicateList.map(p => p.serialize())
        };
        
        const encodedQuery = btoa(JSON.stringify(queryData));
        const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        const shareUrl = `${baseUrl}?q=${encodedQuery}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                // console.log('URL copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy URL to clipboard:', err);
            });
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    };

    const populateCustomPredicate = (position: IPositionInput, replace: boolean) => {
        setIsQueryCollapsed(false);

        if (replace) {
            const filter = props.predicateList[props.predicateList.length - 1];
            filter.brainAreaFilterType = BRAIN_AREA_FILTER_TYPE_SPHERE;
            filter.filter.arbCenter = {
                x: position.x.toFixed(1),
                y: position.y.toFixed(1),
                z: position.z.toFixed(1)
            };
            props.predicates.replacePredicate(filter);
        } else {
            props.predicates.addPredicate({
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
    };

    const onToggleBrainArea = (id: string) => {
        visibleBrainAreasRef.current.toggle(id);
        setVisibleBrainAreas(visibleBrainAreasRef.current.BrainAreas);
    };

    const onRemoveBrainAreaFromHistory = (viewModel: BrainCompartmentViewModel) => {
        viewModel.shouldIncludeInHistory = false;
        setVisibleBrainAreas(visibleBrainAreasRef.current.BrainAreas);
    };

    const onMutateBrainAreas = (added: string[], removed: string[]) => {
        visibleBrainAreasRef.current.mutate(added, removed);
        setVisibleBrainAreas(visibleBrainAreasRef.current.BrainAreas);
    };

    const queryStatus = props.isInQuery ? QueryStatus.Loading : (props.totalCount >= 0 ? QueryStatus.Loaded : QueryStatus.NeverQueried);

    const queryProps: any = {
        constants: props.constants,
        predicates: props.predicates,
        predicateList: props.predicateList,
        isCollapsed: isQueryCollapsed,
        status: queryStatus,
        neuronSystemCount: props.totalCount,
        neuronMatchCount: props.neurons.length,
        queryDuration: props.queryTime,
        onPerformQuery: onPerformQuery,
        onResetPage: onResetPage,
        onShare: onShare,
        onToggleCollapsed: () => setIsQueryCollapsed(!isQueryCollapsed),
    };

    const viewerProps = {
        constants: props.constants,
        isQueryCollapsed: isQueryCollapsed,
        queryStatus: queryStatus,
        neurons: props.neurons,
        visibleBrainAreas: visibleBrainAreas,
        isLoading: props.isInQuery,
        nonce: props.queryNonce,
        shouldAlwaysShowFullTracing: props.shouldAlwaysShowFullTracing,
        shouldAlwaysShowSoma: props.shouldAlwaysShowSoma,
        exportLimit: props.exportLimit,
        compartmentMeshVersion: ViewerMeshVersion.AibsCcf,
        ref: (r: any) => mainViewRef.current = r,
        onToggleQueryCollapsed: () => setIsQueryCollapsed(!isQueryCollapsed),
        populateCustomPredicate: (p: IPositionInput, b: boolean) => populateCustomPredicate(p, b),
        onToggleBrainArea: (id: string) => onToggleBrainArea(id),
        onRemoveBrainAreaFromHistory: (id: BrainCompartmentViewModel) => onRemoveBrainAreaFromHistory(id),
        onMutateBrainAreas: (added: string[], removed: string[]) => onMutateBrainAreas(added, removed)
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
});
