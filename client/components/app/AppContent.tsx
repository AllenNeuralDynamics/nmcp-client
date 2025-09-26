import * as React from "react";
import {observer} from "mobx-react-lite";

import {Content} from "../page/Content";
import {AppTomography} from "./AppTomography";
import {useContext} from "react";
import {ConstantsContext} from "./AppConstants";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";

export const AppContent = observer(() => {
    const Constants = useContext(ConstantsContext);

    const systemConfiguration = useSystemConfiguration();

    return (
        <AppTomography>
            <Content constants={Constants} systemVersion={systemConfiguration.systemVersion} exportLimit={systemConfiguration.exportLimit}/>
        </AppTomography>
    );
});
