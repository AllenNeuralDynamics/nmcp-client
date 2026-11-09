import {isPageSize, PageSettingsDefinition, PageSettingsKeys} from "../../util/pageSettings";
import {CandidateFilterSettings, DefaultCandidateFilterSettings, sanitizeCandidateFilterSettings} from "../../viewmodel/candidateFilter";

export type CandidatesLayoutSettings = {
    filtersExpanded: boolean;
    tableExpanded: boolean;
    visibleRowCount: number;
    viewerPinned: boolean;
}

export type CandidatesPageSettings = {
    version: number;
    filters: CandidateFilterSettings;
    layout: CandidatesLayoutSettings;
    selectedId: string | null;
}

const DefaultVisibleRowCount = 10;

export const CandidatesSettings: PageSettingsDefinition<CandidatesPageSettings> = {
    key: PageSettingsKeys.candidates,
    defaults: {
        version: 1,
        filters: DefaultCandidateFilterSettings,
        layout: {filtersExpanded: true, tableExpanded: true, visibleRowCount: DefaultVisibleRowCount, viewerPinned: true},
        selectedId: null
    },
    sanitize: settings => ({
        ...settings,
        filters: sanitizeCandidateFilterSettings(settings.filters),
        layout: {
            ...settings.layout,
            visibleRowCount: isPageSize(settings.layout.visibleRowCount) ? settings.layout.visibleRowCount : DefaultVisibleRowCount
        }
    })
};
