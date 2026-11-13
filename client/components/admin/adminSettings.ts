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
import {AccessRequestStatusFilterOptions, FeedbackStatusFilterOptions} from "../common/filters/AccessRequestStatusFilter";

export const AdminTabs = ["users", "accessrequests", "feedback", "collections", "published", "issues", "apikeys"];

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
    feedback: AdminAccessRequestsSettings;
}

// Unreviewed requests are the ones that require action, so they are what is shown until the user asks for something else.
// Each call makes its own list, since numberList tags the instance with its element type.
function unreviewedRequestDefaults(): AdminAccessRequestsSettings {
    return {
        filters: {statuses: {enabled: true, contents: numberList(AccessRequestStatus.Unreviewed)}},
        pagination: DefaultPagination,
        selectedId: null
    };
}

function sanitizeRequests(settings: AdminAccessRequestsSettings, allowed: AccessRequestStatus[]): AdminAccessRequestsSettings {
    return {
        ...settings,
        filters: {
            statuses: {
                ...settings.filters.statuses,
                contents: settings.filters.statuses.contents.filter(s => allowed.includes(s))
            }
        },
        pagination: sanitizePagination(settings.pagination)
    };
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
        accessRequests: unreviewedRequestDefaults(),
        feedback: unreviewedRequestDefaults()
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
        accessRequests: sanitizeRequests(settings.accessRequests, AccessRequestStatusFilterOptions),
        feedback: sanitizeRequests(settings.feedback, FeedbackStatusFilterOptions)
    })
};
