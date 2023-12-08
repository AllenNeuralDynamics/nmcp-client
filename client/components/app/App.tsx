import * as React from "react";

import {ApolloApp} from "./ApolloApp";

import {rootDataStore} from "../../store/system/systemDataStore";
import {rootViewModel} from "../../store/viewModel/systemViewModel";

const rootStoreContext = React.createContext(rootDataStore);

const rootViewModelContext = React.createContext(rootViewModel);

export const useStore = () => {
    return React.useContext(rootStoreContext)
};

export const useViewModel = () => {
    return React.useContext(rootViewModelContext)
};

export const App = () => (
    <ApolloApp/>
);
