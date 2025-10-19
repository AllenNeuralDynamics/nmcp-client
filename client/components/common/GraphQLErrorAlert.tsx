import * as React from "react";
import {ApolloError} from "@apollo/client";
import {Alert, List, Stack, Text} from "@mantine/core";
import {IconExclamationCircle} from "@tabler/icons-react";

export const GraphQLErrorAlert = ({title, error}: { title: string, error: ApolloError }) => {
    console.log(error);

    const graphQLErrors = error.graphQLErrors?.filter(e => e.message != error.message) || [];

    const errorList = () => {
        if (error.cause?.name == "ServerError" && error.cause["statusCode"] == 504) {
            const result = <Text size="xs" c="dimmed">The NMCP Server appears to be unavailable.  Connection will be retried shortly</Text>;
            setTimeout(() => window.location.reload(), 60000);
            return result;
        }

        if (error.cause?.name == "ServerError" && error.cause["statusCode"] == 400 && error.cause["result"]?.errors?.length > 0) {
            if (error.cause["result"].errors.length == 1) {
                return <Text size="xs" c="dimmed">{error.cause["result"].errors[0].message}</Text>;
            }
            return (
                <List>
                    {error.cause["result"].errors.map(({message}, i) => <List.Item><Text size="sm" c="dimmed" key={i}> {message}</Text></List.Item>)}
                </List>
            );
        }

        if (graphQLErrors.length == 0) {
            return null;
        }
        if (graphQLErrors.length == 1) {
            return <Text size="xs" c="dimmed">{graphQLErrors[0].message}</Text>;
        }
        return (
            <List>
                {graphQLErrors.map(({message}, i) => <List.Item><Text size="sm" c="dimmed" key={i}> {message}</Text></List.Item>)}
            </List>
        );
    }

    return (
        <Alert variant="light" color="red" radius={0} title={title} icon={<IconExclamationCircle/>}>
            <Stack gap={0}>
                <Text size="sm">{error.message}</Text>
                {errorList()}
            </Stack>
        </Alert>
    );

}
