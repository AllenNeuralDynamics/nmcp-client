import {createContext, useContext} from "react";

import {SystemConfiguration} from "../viewmodel/systemConfiguration";

const systemConfiguration = createContext<SystemConfiguration>(new SystemConfiguration())

export const useSystemConfiguration = () => useContext(systemConfiguration);
