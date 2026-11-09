import {DefaultPagination, oneOf, PageSettingsDefinition, PageSettingsKeys, PaginationSettings, sanitizePagination, stringList} from "../../util/pageSettings";
import {OptionalFilterSettings} from "../../viewmodel/candidateFilter";
import {ReviewStatusEntries} from "./reviewAccess";

export const ReviewDetailTabs = ["status", "specimen", "atlas", "quality"];

export type ReviewPageSettings = {
    version: number;
    filters: {
        approvalOnly: boolean;
        specimens: OptionalFilterSettings<string[]>;
        keywords: OptionalFilterSettings<string>;
        statuses: OptionalFilterSettings<string[]>;
    };
    pagination: PaginationSettings;
    selectedId: string | null;
    detailTab: string;
}

// The full list, not the user's available entries: a status hidden by role or Approval Only is kept, an obsolete one dropped.
const statusValues = ReviewStatusEntries.map(e => e.value);

export const ReviewSettings: PageSettingsDefinition<ReviewPageSettings> = {
    key: PageSettingsKeys.review,
    defaults: {
        version: 1,
        filters: {
            approvalOnly: false,
            specimens: {enabled: false, contents: stringList()},
            keywords: {enabled: false, contents: ""},
            statuses: {enabled: false, contents: stringList()}
        },
        pagination: DefaultPagination,
        selectedId: null,
        detailTab: "status"
    },
    sanitize: settings => ({
        ...settings,
        filters: {
            ...settings.filters,
            statuses: {...settings.filters.statuses, contents: settings.filters.statuses.contents.filter(s => statusValues.includes(s))}
        },
        pagination: sanitizePagination(settings.pagination),
        detailTab: oneOf(settings.detailTab, ReviewDetailTabs, "status")
    })
};
