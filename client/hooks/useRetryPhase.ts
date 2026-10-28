import {useApolloClient} from "@apollo/client";

import {Annotation} from "../models/annotation";
import {ANNOTATIONS_QUERY, RETRY_PHASE_MUTATIONS} from "../graphql/annotation";
import {errorNotification} from "../components/common/NotificationHelper";

export function useRetryPhase(): (reconstruction: Annotation) => Promise<void> {
    const client = useApolloClient();

    return async (reconstruction: Annotation) => {
        const mutation = RETRY_PHASE_MUTATIONS[reconstruction.atlasReconstruction?.status];

        // The button is only enabled when an entry exists.
        if (!mutation) {
            throw new Error(`No retry exists for atlas reconstruction status ${reconstruction.atlasReconstruction?.status}.`);
        }

        try {
            await client.mutate({mutation, variables: {annotationId: reconstruction.id}, refetchQueries: [ANNOTATIONS_QUERY]});
        } catch (e) {
            errorNotification("Error Retrying Phase", e);
        }
    };
}
