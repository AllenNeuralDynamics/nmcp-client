import {action, makeObservable, observable} from "mobx";

import {UserPreferences} from "../util/userPreferences";

export enum DrawerState {
    Hidden,
    Float,
    Dock
}

export class AppLayout {
    public isNeuronListOpen: boolean = false;
    public isNeuronListDocked: boolean = UserPreferences.Instance.IsNeuronListDocked;
    public isCompartmentListOpen: boolean = false;
    public isCompartmentListDocked: boolean = UserPreferences.Instance.IsCompartmentListDocked;
    public isQueryExpanded: boolean = true;
    public isAtlasStructureHistoryExpanded: boolean = true;

    public constructor() {
        makeObservable(this, {
            isNeuronListOpen: observable,
            isNeuronListDocked: observable,
            isCompartmentListOpen: observable,
            isCompartmentListDocked: observable,
            isQueryExpanded: observable,
            isAtlasStructureHistoryExpanded: observable,
            setNeuronDrawerState: action,
            setAtlasStructureDrawerState: action
        });
    }

    public setNeuronDrawerState(drawerState: DrawerState) {
        if (drawerState === DrawerState.Hidden) {
            // Close the docked or drawer
            UserPreferences.Instance.IsNeuronListDocked = false;
            this.isNeuronListDocked = false;
            this.isNeuronListOpen = false;
        } else if (drawerState === DrawerState.Float) {
            // Pin the float
            UserPreferences.Instance.IsNeuronListDocked = false;
            this.isNeuronListDocked = false;
            this.isNeuronListOpen = true;
        } else {
            UserPreferences.Instance.IsNeuronListDocked = true;
            this.isNeuronListDocked = true;
            this.isNeuronListOpen = false;
        }
    }

    public setAtlasStructureDrawerState(drawerState: DrawerState) {
        if (drawerState === DrawerState.Hidden) {
            // Close the docked or drawer
            UserPreferences.Instance.IsCompartmentListDocked = false;
            this.isCompartmentListDocked = false;
            this.isCompartmentListOpen = false;
        } else if (drawerState === DrawerState.Float) {
            // Pin the float
            UserPreferences.Instance.IsCompartmentListDocked = false;
            this.isCompartmentListDocked = false;
            this.isCompartmentListOpen = true;
        } else {
            UserPreferences.Instance.IsCompartmentListDocked = true;
            this.isCompartmentListDocked = true;
            this.isCompartmentListOpen = false;
        }
    }
}
