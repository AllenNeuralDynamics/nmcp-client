import {useApolloClient} from "@apollo/client";

import {useAppLayout} from "./useAppLayout";
import {usePreferences} from "./usePreferences";
import {useQueryResponseViewModel} from "./useQueryResponseViewModel";
import {useUIQuery} from "./useUIQuery";

export function usePerformQuery(): () => Promise<void> {
    const client = useApolloClient();
    const preferences = usePreferences();
    const appLayout = useAppLayout();
    const queryResponse = useQueryResponseViewModel();
    const uiQuery = useUIQuery();

    return async () => {
        if (!appLayout.isQueryExpanded && !preferences.ShouldAutoCollapseOnQuery) {
            appLayout.isQueryExpanded = true;
        }

        await uiQuery.execute(queryResponse, client);
    };
}
