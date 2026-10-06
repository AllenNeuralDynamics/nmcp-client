import {action, computed, makeObservable, observable} from "mobx";

import {Atlas} from "../models/atlas";
import {AtlasViewModel} from "./atlasViewModel";

export class AtlasSelection {
    public atlasViewModel: AtlasViewModel = null;

    public constructor(atlas: Atlas = null) {
        if (atlas) {
            this.atlasViewModel = new AtlasViewModel(atlas);
        }

        makeObservable(this, {
            atlasViewModel: observable.ref,
            atlas: computed,
            atlasId: computed,
            select: action
        });
    }

    public get atlas(): Atlas {
        return this.atlasViewModel?.atlas ?? null;
    }

    public get atlasId(): string {
        return this.atlas?.id ?? null;
    }

    // A no-op for the current atlas: AppConstants calls this during render, and rebuilding would discard the user's
    // displayed structures and history.
    public select(atlas: Atlas) {
        if ((atlas?.id ?? null) === this.atlasId) {
            return;
        }

        this.atlasViewModel = atlas ? new AtlasViewModel(atlas) : null;
    }
}
