import * as React from "react";
import {useQuery} from "@apollo/client";

import {ISSUE_COUNT_QUERY, IssueCountResponse} from "../../graphql/issue";
import {UserPermissions} from "../../graphql/user";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";
import {useUser} from "../../hooks/useUser";
import {useContext} from "react";
import {UserContext} from "./UserApp";
import {Stack} from "@mantine/core";

export interface Notifications {
    issueCount: number;
}

type NotificationsAppProps = {
    children?: any;
}

export const NotificationContext = React.createContext<Notifications>({issueCount: 0});

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

const Notifications = (props: NotificationsAppProps) => {
    const {loading, error, data} = useQuery<IssueCountResponse>(ISSUE_COUNT_QUERY, {
        fetchPolicy: "no-cache", pollInterval: 10000
    });

    if (error) {
        return <GraphQLErrorAlert title="Issue Counts Could not be Loaded" error={error}/>;
    }

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
