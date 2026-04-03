import {autorun, makeAutoObservable} from "mobx";

import {UserPreferences} from "../util/userPreferences";

export enum DrawerState {
    Dock = 0,
    Hidden = 1
}

export type AppLayoutState = {
    neuronDrawerState: DrawerState;
    atlasStructureDrawerState: DrawerState;
    isQueryExpanded: boolean;
    isAtlasStructureTreeExpanded: boolean;
    isAtlasStructureHistoryExpanded: boolean;
}

export class AppLayout {
    public neuronDrawerState: DrawerState = DrawerState.Dock;
    public atlasStructureDrawerState: DrawerState = DrawerState.Dock;
    public isQueryExpanded: boolean = true;
    public isAtlasStructureTreeExpanded: boolean = true;
    public isAtlasStructureHistoryExpanded: boolean = true;
    public isPreferencesWindowOpen: boolean = false;

    public neuroglancerControlsVisible: boolean = false;
    public neuroglancerDimensionsVisible: boolean = false;

    public showReferenceIds: boolean = false;

    public constructor() {
        const layout = UserPreferences.Instance.AppLayoutState as any;

        if (layout != null) {
            this.neuronDrawerState = layout.neuronDrawerState ?? DrawerState.Dock;
            this.atlasStructureDrawerState = layout.atlasStructureDrawerState ?? DrawerState.Dock;
            this.isQueryExpanded = layout.isQueryExpanded ?? true;
            this.isAtlasStructureTreeExpanded = layout.isAtlasStructureTreeExpanded ?? true;
            this.isAtlasStructureHistoryExpanded = layout.isAtlasStructureHistoryExpanded ?? true;
            this.isPreferencesWindowOpen = layout.isPreferencesWindowOpen ?? false;

            this.neuroglancerControlsVisible = layout.neuroglancerControlsVisible ?? false;
            this.neuroglancerDimensionsVisible = layout.neuroglancerDimensionsVisible ?? false;

            this.showReferenceIds = layout.showReferenceIds ?? false;
        }

        this.updateNeuroglancerControlsVisible(this.neuroglancerControlsVisible);
        this.updateNeuroglancerDimensionsVisible(this.neuroglancerDimensionsVisible);

        makeAutoObservable(this);

        autorun(() => {
            UserPreferences.Instance.AppLayoutState = this;
        })
    }

    public openSettingsDialog() {
        this.isPreferencesWindowOpen = true;
    }

    public closeSettingsDialog() {
        this.isPreferencesWindowOpen = false;
    }

    public setNeuronDrawerState(drawerState: DrawerState) {
        this.neuronDrawerState = drawerState;
    }

    public setAtlasStructureDrawerState(drawerState: DrawerState) {
        this.atlasStructureDrawerState = drawerState;
    }

    public toggleNeuroglancerControlsVisible() {
        const visible = !this.neuroglancerControlsVisible;
        this.updateNeuroglancerControlsVisible(visible);
        this.neuroglancerControlsVisible = visible;
    }

    public toggleNeuroglancerDimensionsVisible() {
        const visible = !this.neuroglancerDimensionsVisible;
        this.updateNeuroglancerDimensionsVisible(visible);
        this.neuroglancerDimensionsVisible = visible;
    }

    public serialize(): AppLayoutState {
        return {
            neuronDrawerState: this.neuronDrawerState,
            atlasStructureDrawerState: this.atlasStructureDrawerState,
            isQueryExpanded: this.isQueryExpanded,
            isAtlasStructureTreeExpanded: this.isAtlasStructureTreeExpanded,
            isAtlasStructureHistoryExpanded: this.isAtlasStructureHistoryExpanded
        }
    }

    public deserialize(state: AppLayoutState) {
        this.neuronDrawerState = state.neuronDrawerState ?? DrawerState.Dock;
        this.atlasStructureDrawerState = state.atlasStructureDrawerState ?? DrawerState.Dock;
        this.isQueryExpanded = state.isQueryExpanded ?? true;
        this.isAtlasStructureTreeExpanded = state.isAtlasStructureTreeExpanded ?? true;
        this.isAtlasStructureHistoryExpanded = state.isAtlasStructureHistoryExpanded ?? true;
    }

    private updateNeuroglancerControlsVisible(visible: boolean) {
        document.documentElement.style.setProperty("--neuroglancer-topview-height", visible ? "30px" : "0px");
        document.documentElement.style.setProperty("--neuroglancer-topview-visibility", visible ? "visible" : "collapse");
    }

    private updateNeuroglancerDimensionsVisible(visible: boolean) {
        document.documentElement.style.setProperty("--neuroglancer-display-dimensions", visible ? "visible" : "collapse");
    }
}
