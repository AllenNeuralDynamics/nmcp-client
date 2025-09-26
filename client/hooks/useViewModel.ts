import * as React from "react";

import {systemViewModel} from "../store/viewModel/systemViewModel";


const rootViewModelContext = React.createContext(systemViewModel);

export const useViewModel = () => {
    return React.useContext(rootViewModelContext)
};
