import * as React from "react";
import {useQuery} from "@apollo/client";
import {ISSUE_COUNT_QUERY, IssueCountResponse} from "../../graphql/issue";

export interface Notifications {
    issueCount: number;
}

type NotificationsAppProps = {
    children: any;
}

export const NotificationContext = React.createContext<Notifications>({issueCount: 0});

export const NotificationsApp = (props: NotificationsAppProps) => {
    const {loading, error, data} = useQuery<IssueCountResponse>(ISSUE_COUNT_QUERY, {
        fetchPolicy: "no-cache", pollInterval: 10000
    });

    if (!error && !loading && data) {
        return (<NotificationContext.Provider value={{issueCount: data.issueCount}}>
                {props.children}
            </NotificationContext.Provider>
        );
    } else {
        return (
            <div>
                {props.children}
            </div>
        );
    }
}
