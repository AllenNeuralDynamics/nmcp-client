import type {AdminPublishingSettings} from "../adminSettings";
import {SettingsChange} from "../../../util/pageSettings";

export type StatusFilterType = "published" | "in-progress" | "publishable" | "finalizing" | "publish-failed";

export const StatusFilterTypes: StatusFilterType[] = ["published", "in-progress", "publishable", "finalizing", "publish-failed"];

// Changing the filter or the page clears the selection.  The page keeps rendering previousData while the new query
// loads, so without this the old row would stay resolvable, and Retry Phase live, against a row no longer on screen.
export function usePublishedQueueState(settings: AdminPublishingSettings, onSettingsChange: SettingsChange<AdminPublishingSettings>) {
    return {
        statusFilter: settings.filters.status,
        offset: settings.pagination.offset,
        limit: settings.pagination.limit,
        selectedId: settings.selectedId,
        setStatusFilter: (status: StatusFilterType) => {
            onSettingsChange(s => ({...s, filters: {...s.filters, status}, selectedId: null}));
        },
        setOffset: (offset: number) => {
            onSettingsChange(s => ({...s, pagination: {...s.pagination, offset}, selectedId: null}));
        },
        setLimit: (limit: number) => {
            onSettingsChange(s => ({...s, pagination: {...s.pagination, limit}, selectedId: null}));
        },
        setSelectedId: (selectedId: string) => {
            onSettingsChange(s => ({...s, selectedId}));
        }
    };
}
