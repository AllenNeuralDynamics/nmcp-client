import {createContext, useContext} from "react";

import {UIQueryPredicates} from "../viewmodel/uiQueryPredicate";

const QueryPredicatesContext = createContext<UIQueryPredicates>(new UIQueryPredicates())

export const useQueryPredicates = () => useContext(QueryPredicatesContext);
