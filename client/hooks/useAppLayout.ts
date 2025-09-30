import {createContext, useContext} from "react";

import {AppLayout} from "../viewmodel/appLayout";

const appLayoutContext = createContext(new AppLayout());

export const useAppLayout = () => useContext(appLayoutContext);
