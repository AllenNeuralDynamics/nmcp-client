import * as React from "react";

import {SystemConfiguration} from "../store/system/systemConfiguration";

const systemConfiguration = React.createContext<SystemConfiguration>(new SystemConfiguration())

export const useSystemConfiguration = () => {
    return React.useContext(systemConfiguration);
};
