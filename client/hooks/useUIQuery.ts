import {createContext, useContext} from "react";

import {UIQuery} from "../viewmodel/uiQuery";

const QueryPredicatesContext = createContext<UIQuery>(new UIQuery())

export const useUIQuery = () => useContext(QueryPredicatesContext);
