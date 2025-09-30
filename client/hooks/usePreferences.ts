import {createContext, useContext} from "react";

import {PreferencesViewModel} from "../viewmodel/preferencesViewModel";

const preferencesContext = createContext(new PreferencesViewModel());

export const usePreferences = () => useContext(preferencesContext);
