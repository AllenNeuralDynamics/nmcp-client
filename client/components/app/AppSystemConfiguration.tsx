import * as React from "react";
import {observer} from "mobx-react-lite";

import {useLoadSystemConfiguration} from "../../hooks/useLoadSystemConfiguration";
import {useStore} from "./App";
import {AppLoading} from "./AppLoading";

export const AppSystemConfiguration = observer((props: any) => {
    useLoadSystemConfiguration();

    const {SystemConfiguration} = useStore();

    if (SystemConfiguration.exportLimit === 0) {
        return <AppLoading message="initializing system configuration"/>;
    }

    return props.children;
});
