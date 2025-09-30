import {createContext, useContext} from "react";

import {QueryResponseViewModel} from "../viewmodel/queryResponseViewModel";

export const QueryResponseViewModelContext = createContext<QueryResponseViewModel>(new QueryResponseViewModel())

export const useQueryResponseViewModel = () => useContext(QueryResponseViewModelContext);
