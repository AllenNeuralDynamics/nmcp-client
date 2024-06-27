import * as React from "react";
import {observer} from "mobx-react-lite";

import {useStore} from "./App";
import {Content} from "../page/Content";
import {AppTomography} from "./AppTomography";

export const AppContent = observer(() => {
    const {SystemConfiguration, Constants} = useStore();

    return (
        <AppTomography>
            <Content constants={Constants} systemVersion={SystemConfiguration.systemVersion} exportLimit={SystemConfiguration.exportLimit}/>
        </AppTomography>
    );
});
