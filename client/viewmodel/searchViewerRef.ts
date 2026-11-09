import {makeAutoObservable} from "mobx";

import {SearchViewer} from "../viewer/searchViewer";

export class SearchViewerRef {
    viewer: SearchViewer | null = null;

    // Neuroglancer's state is not observable; this counts its (debounced) changes so reactions can follow it.
    stateGeneration: number = 0;

    private _pendingState: object | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    register(viewer: SearchViewer): boolean {
        this.viewer = viewer;

        viewer.stateListener = () => this.stateChanged();

        if (this._pendingState) {
            viewer.updateState(this._pendingState);
            this._pendingState = null;
            return true;
        }

        return false;
    }

    unregister() {
        if (this.viewer) {
            this._pendingState = this.viewer.currentState;
        }
        this.viewer = null;
    }

    stateChanged() {
        this.stateGeneration++;
    }

    get currentState(): object | null {
        return this.viewer?.currentState ?? null;
    }

    get shareableState(): object | null {
        // A computed, so it reads the generation or an observer would keep its first value.
        void this.stateGeneration;

        return this.viewer?.shareableState ?? null;
    }

    applyState(state: object) {
        if (this.viewer) {
            this.viewer.updateState(state);
        } else {
            this._pendingState = state;
        }
    }
}
