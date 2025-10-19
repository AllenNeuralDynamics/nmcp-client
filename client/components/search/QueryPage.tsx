import * as React from "react";
import {observer} from "mobx-react-lite";
import {Stack} from "@mantine/core";

import {QueryFilterContainer} from "./query/QueryFilterContainer";
import {MainView} from "./output/MainView";

export const QueryPage = observer(() => {
    return (
        <Stack gap={0} style={{flexGrow: 1}}>
            <QueryFilterContainer/>
            <MainView/>
        </Stack>
    );
});
