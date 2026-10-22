import * as React from "react";
import {useEffect, useState} from "react";

import {CandidatesTableHandle} from "./CandidatesTable";

type PendingScroll = {
    id: string;
    offset: number;
}

// A viewer selection can resolve before the table has mounted, or before it has rendered a count that holds the row,
// so the scroll target waits here until the table can honour it, or until the selection moves on.
export function usePendingTableScroll(tableRef: React.RefObject<CandidatesTableHandle>, tableReady: boolean, totalCount: number | null,
                                      selectedId: string | null): (id: string, offset: number) => void {
    const [pending, setPending] = useState<PendingScroll>(null);

    useEffect(() => {
        if (!pending) {
            return;
        }

        if (pending.id !== selectedId) {
            setPending(null);
            return;
        }

        if (tableReady && tableRef.current && totalCount !== null && pending.offset < totalCount) {
            tableRef.current.scrollToRow(pending.offset);
            setPending(null);
        }
    }, [pending, tableReady, totalCount, selectedId]);

    return (id: string, offset: number) => setPending({id, offset});
}
