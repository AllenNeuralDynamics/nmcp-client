import {
    DefaultPagination,
    numberList,
    oneOf,
    PageSettingsDefinition,
    PageSettingsKeys,
    PaginationSettings,
    sanitizePagination,
    SettingsChange
} from "../../util/pageSettings";
import {OptionalFilterSettings} from "../../viewmodel/candidateFilter";
import {AccessRequestStatus} from "../../models/accessRequest";
import {StatusFilterType, StatusFilterTypes} from "./published/usePublishedQueueState";
import {AccessRequestStatusFilterOptions} from "../common/filters/AccessRequestStatusFilter";

export const AdminTabs = ["users", "accessrequests", "collections", "published", "issues", "apikeys"];

export type AdminTabProps<T> = {
    settings: T;

    onSettingsChange: SettingsChange<T>;
}

export type AdminUsersSettings = {
    filters: { includeImported: boolean };
    pagination: PaginationSettings;
}

export type AdminSelectionSettings = {
    selectedId: string | null;
}

export type AdminPublishingSettings = {
    filters: { status: StatusFilterType };
    pagination: PaginationSettings;
    selectedId: string | null;
}

export type AdminAccessRequestsSettings = {
    filters: { statuses: OptionalFilterSettings<AccessRequestStatus[]> };
    pagination: PaginationSettings;
    selectedId: string | null;
}

export type AdminPageSettings = {
    version: number;
    tab: string;
    users: AdminUsersSettings;
    collections: AdminSelectionSettings;
    publishing: AdminPublishingSettings;
    issues: AdminSelectionSettings;
    accessRequests: AdminAccessRequestsSettings;
}

export const AdminSettings: PageSettingsDefinition<AdminPageSettings> = {
    key: PageSettingsKeys.admin,
    defaults: {
        version: 1,
        tab: "users",
        users: {filters: {includeImported: false}, pagination: DefaultPagination},
        collections: {selectedId: null},
        publishing: {filters: {status: "published"}, pagination: DefaultPagination, selectedId: null},
        issues: {selectedId: null},
        // Unreviewed requests are the ones that require action, so they are what is shown until the user asks for something else.
        accessRequests: {
            filters: {statuses: {enabled: true, contents: numberList(AccessRequestStatus.Unreviewed)}},
            pagination: DefaultPagination,
            selectedId: null
        }
    },
    sanitize: settings => ({
        ...settings,
        tab: oneOf(settings.tab, AdminTabs, "users"),
        users: {...settings.users, pagination: sanitizePagination(settings.users.pagination)},
        publishing: {
            ...settings.publishing,
            filters: {status: oneOf(settings.publishing.filters.status, StatusFilterTypes, "published")},
            pagination: sanitizePagination(settings.publishing.pagination)
        },
        accessRequests: {
            ...settings.accessRequests,
            filters: {
                statuses: {
                    ...settings.accessRequests.filters.statuses,
                    contents: settings.accessRequests.filters.statuses.contents.filter(s => AccessRequestStatusFilterOptions.includes(s))
                }
            },
            pagination: sanitizePagination(settings.accessRequests.pagination)
        }
    })
};
