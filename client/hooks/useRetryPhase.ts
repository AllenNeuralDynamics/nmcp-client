import {useApolloClient} from "@apollo/client";

import {Reconstruction} from "../models/reconstruction";
import {RECONSTRUCTIONS_QUERY, RETRY_PHASE_MUTATIONS} from "../graphql/reconstruction";
import {errorNotification} from "../components/common/NotificationHelper";

export function useRetryPhase(): (reconstruction: Reconstruction) => Promise<void> {
    const client = useApolloClient();

    return async (reconstruction: Reconstruction) => {
        const mutation = RETRY_PHASE_MUTATIONS[reconstruction.atlasReconstruction?.status];

        // The button is only enabled when an entry exists.
        if (!mutation) {
            throw new Error(`No retry exists for atlas reconstruction status ${reconstruction.atlasReconstruction?.status}.`);
        }

        try {
            await client.mutate({mutation, variables: {reconstructionId: reconstruction.id}, refetchQueries: [RECONSTRUCTIONS_QUERY]});
        } catch (e) {
            errorNotification("Error Retrying Phase", e);
        }
    };
}
