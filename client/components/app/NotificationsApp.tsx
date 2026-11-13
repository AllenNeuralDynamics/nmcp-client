import * as React from "react";
import {useEffect} from "react";
import {useQuery} from "@apollo/client";
import {Stack} from "@mantine/core";

import {ISSUE_COUNT_QUERY, IssueCountResponse} from "../../graphql/issue";
import {OPEN_REQUEST_COUNT_QUERY, openRequestCountVariables, OpenRequestCountResponse} from "../../graphql/accessRequest";
import {AccessRequestKind} from "../../models/accessRequest";
import {UserPermissions} from "../../graphql/user";
import {useUser} from "../../hooks/useUser";

export interface Notifications {
    issueCount: number;
    openFeedbackCount: number;
    openAccessRequestCount: number;
}

type NotificationsAppProps = {
    children?: any;
}

export const NotificationContext = React.createContext<Notifications>({issueCount: 0, openFeedbackCount: 0, openAccessRequestCount: 0});

export const NotificationsApp = (props: NotificationsAppProps) => {
    const user = useUser();

    if (user && ((user.permissions & UserPermissions.Admin) != 0)) {
        return <Notifications {...props} />;
    } else {
        return (
            <Stack justify="stretch" gap={0} h="100%">
                {props.children}
            </Stack>
        );
    }
}

// Always the provider, so the count arriving never changes the element type above the page and remounts it.  A failed
// poll keeps the last count rather than replacing the page with an error.
const Notifications = (props: NotificationsAppProps) => {
    const {error, data, previousData} = useQuery<IssueCountResponse>(ISSUE_COUNT_QUERY, {
        fetchPolicy: "no-cache", pollInterval: 10000
    });

    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    const issueCount = (data ?? previousData)?.issueCount ?? 0;

    const openFeedbackCount = useOpenRequestCount(AccessRequestKind.Feedback);

    const openAccessRequestCount = useOpenRequestCount(AccessRequestKind.Access);

    return (
        <NotificationContext.Provider value={{issueCount, openFeedbackCount, openAccessRequestCount}}>
            {props.children}
        </NotificationContext.Provider>
    );
}

function useOpenRequestCount(kind: AccessRequestKind): number {
    const {error, data, previousData} = useQuery<OpenRequestCountResponse>(OPEN_REQUEST_COUNT_QUERY, {
        variables: openRequestCountVariables(kind), fetchPolicy: "no-cache", pollInterval: 10000
    });

    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    return (data ?? previousData)?.accessRequests?.totalCount ?? 0;
}
