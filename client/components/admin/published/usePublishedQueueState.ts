import {useState} from "react";

export type StatusFilterType = "published" | "in-progress" | "publishable" | "finalizing" | "publish-failed";

// Changing the filter or the page clears the selection.  The page keeps rendering previousData while the new query
// loads, so without this the old row would stay resolvable, and Retry Phase live, against a row no longer on screen.
export function usePublishedQueueState() {
    const [statusFilter, setStatusFilterState] = useState<StatusFilterType>("published");
    const [offset, setOffsetState] = useState(0);
    const [limit, setLimitState] = useState(10);
    const [selectedId, setSelectedId] = useState<string>(null);

    return {
        statusFilter,
        offset,
        limit,
        selectedId,
        setStatusFilter: (value: StatusFilterType) => {
            setStatusFilterState(value);
            setSelectedId(null);
        },
        setOffset: (value: number) => {
            setOffsetState(value);
            setSelectedId(null);
        },
        setLimit: (value: number) => {
            setLimitState(value);
            setSelectedId(null);
        },
        setSelectedId
    };
}
