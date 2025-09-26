import * as React from "react";
import {observer} from "mobx-react-lite";

import {useLoadSystemConfiguration} from "../../hooks/useLoadSystemConfiguration";
import {AppLoading} from "./AppLoading";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";

export const AppSystemConfiguration = observer((props: any) => {
    useLoadSystemConfiguration();

    const systemConfiguration = useSystemConfiguration();

    if (systemConfiguration.exportLimit === 0) {
        return <AppLoading message="initializing system configuration"/>;
    }

    return props.children;
});
