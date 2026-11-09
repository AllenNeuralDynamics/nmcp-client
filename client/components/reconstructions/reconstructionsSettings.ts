import {DefaultPagination, numberList, PageSettingsDefinition, PageSettingsKeys, PaginationSettings, sanitizePagination, stringList} from "../../util/pageSettings";
import {OptionalFilterSettings} from "../../viewmodel/candidateFilter";
import {AnnotationStatus, filterableAnnotationStatuses} from "../../models/annotationStatus";

export type ReconstructionsPageSettings = {
    version: number;
    filters: {
        userOnly: boolean;
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
            userOnly: false,
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
