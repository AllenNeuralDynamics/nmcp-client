import {
    DefaultPagination,
    numberList,
    PageSettingsDefinition,
    PageSettingsKeys,
    PaginationSettings,
    sanitizePagination,
    stringList,
    writeStoredPageSettings
} from "../../util/pageSettings";
import {OptionalFilterSettings} from "../../viewmodel/candidateFilter";
import {AnnotationStatus, filterableAnnotationStatuses} from "../../models/annotationStatus";

export type ReconstructionsPageSettings = {
    version: number;
    filters: {
        myReconstructionsOnly: boolean;
        specimens: OptionalFilterSettings<string[]>;
        statuses: OptionalFilterSettings<AnnotationStatus[]>;
    };
    pagination: PaginationSettings;
    selectedId: string | null;
}

const statusOptions = filterableAnnotationStatuses();

export const ReconstructionsSettings: PageSettingsDefinition<ReconstructionsPageSettings> = {
    key: PageSettingsKeys.reconstructions,
    defaults: {
        version: 1,
        filters: {
            // Renamed from userOnly when the default changed to true: stored values only survive under the new name, so an
            // `off` saved under the old default is dropped and every user starts with this on.  Don't rename it back.
            myReconstructionsOnly: true,
            specimens: {enabled: false, contents: stringList()},
            statuses: {enabled: false, contents: numberList<AnnotationStatus>()}
        },
        pagination: DefaultPagination,
        selectedId: null
    },
    sanitize: settings => ({
        ...settings,
        filters: {
            ...settings.filters,
            statuses: {...settings.filters.statuses, contents: settings.filters.statuses.contents.filter(s => statusOptions.includes(s))}
        },
        pagination: sanitizePagination(settings.pagination)
    })
};

// Narrows Manage Neurons to the user's reconstructions for one specimen, from the first page, so a revision just opened
// elsewhere is very likely in the table.  The status filter is left as the user set it, so it can still hide the row; a
// selected id that isn't in the table selects nothing.
export function focusReconstructionsOnRevision(specimenId: string, reconstructionId: string): void {
    writeStoredPageSettings(ReconstructionsSettings, s => ({
        ...s,
        filters: {...s.filters, myReconstructionsOnly: true, specimens: {enabled: true, contents: [specimenId]}},
        pagination: {...s.pagination, offset: 0},
        selectedId: reconstructionId
    }));
}
