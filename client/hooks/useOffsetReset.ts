import {useEffect} from "react";

// totalCount must come from the response to the current query (data, never previousData), or a stale total from the
// previous variables could reset a valid offset.
export function useOffsetReset(offset: number, totalCount: number | null | undefined, resetOffset: () => void): void {
    useEffect(() => {
        if (totalCount != null && offset > 0 && offset >= totalCount) {
            resetOffset();
        }
    }, [offset, totalCount]);
}
