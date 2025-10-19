import * as React from "react";
import {Loader, Stack, Text} from "@mantine/core";

type AppLoadingProps = {
    message?: string;
}

export const AppLoading: React.FC<AppLoadingProps> = ({message = null}) => {
    return (
        <Stack mt={80} gap="md" align="center" justify="center">
            <Loader color="blue" type="dots"/>
            <Text size="xl">{message || "initializing"}</Text>
        </Stack>
    );
};
