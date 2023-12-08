import * as React from "react";
import {observer} from "mobx-react-lite";

import {useStore} from "./App";
import {Content} from "../page/Content";

export const AppContent = observer(() => {
    const {SystemConfiguration, Constants} = useStore();

    return <Content constants={Constants} searchScope={SystemConfiguration.searchScope}
                    systemVersion={SystemConfiguration.systemVersion} exportLimit={SystemConfiguration.exportLimit}/>;
});
