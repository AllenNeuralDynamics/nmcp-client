import {encodeStateAsFragment} from "neuroglancer/unstable/ui/url_hash_binding.js";
import {bigintToStringJsonReplacer} from "neuroglancer/unstable/util/json.js";

export const NEUROGLANCER_DEMO_URL = "https://neuroglancer-demo.appspot.com/";

const PRESENTATION_KEYS = ["showDefaultAnnotations", "showAxisLines", "crossSectionBackgroundColor", "projectionBackgroundColor"];

const PANEL_KEYS = ["layerListPanel", "selection"];

// The embedded state with the portal's presentation overrides removed, so a standalone viewer falls back to its own
// defaults.  The data and view are unchanged.
export function standaloneViewerState(state: any): any {
    const standalone = {...state};

    for (const key of PRESENTATION_KEYS) {
        delete standalone[key];
    }

    // Drop the whole panel entry, not just `visible`: Neuroglancer restores a selection entry without `visible` as
    // an open panel.
    for (const key of PANEL_KEYS) {
        if (standalone[key]?.visible === false) {
            delete standalone[key];
        }
    }

    return standalone;
}

export function standaloneViewerUrl(state: any): string {
    return `${NEUROGLANCER_DEMO_URL}#!${encodeStateAsFragment(standaloneViewerState(state))}`;
}

// Formatted as Neuroglancer's own state dialog shows it.
export function formatViewerState(state: any): string {
    return JSON.stringify(state, bigintToStringJsonReplacer, "  ");
}
