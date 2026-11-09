import {oneOf, PageSettingsDefinition, PageSettingsKeys} from "../../util/pageSettings";

export const NeuronTabs = ["atlas", "specimen", "quality", "metrics", "history"];

export type NeuronHistorySettings = {
    showSystemEvents: boolean;
    showDetails: boolean;
}

export type NeuronPageSettings = {
    version: number;
    tab: string;
    history: NeuronHistorySettings;
}

export const NeuronSettings: PageSettingsDefinition<NeuronPageSettings> = {
    key: PageSettingsKeys.neuron,
    defaults: {
        version: 1,
        tab: "atlas",
        history: {showSystemEvents: false, showDetails: false}
    },
    sanitize: settings => ({...settings, tab: oneOf(settings.tab, NeuronTabs, "atlas")})
};
