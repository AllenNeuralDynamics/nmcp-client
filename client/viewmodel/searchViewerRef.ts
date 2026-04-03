import {makeAutoObservable} from "mobx";

import {SearchViewer} from "../viewer/searchViewer";

export class SearchViewerRef {
    viewer: SearchViewer | null = null;

    private _pendingState: object | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    register(viewer: SearchViewer): boolean {
        this.viewer = viewer;

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

    get currentState(): object | null {
        return this.viewer?.currentState ?? null;
    }

    applyState(state: object) {
        if (this.viewer) {
            this.viewer.updateState(state);
        } else {
            this._pendingState = state;
        }
    }
}
