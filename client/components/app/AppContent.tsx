import * as React from "react";
import {observer} from "mobx-react-lite";

import {Content} from "../search/Content";

export const AppContent = observer(() => {
    return (
        <Content/>
    );
});
