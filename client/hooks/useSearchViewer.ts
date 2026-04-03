import {createContext, useContext} from "react";

import {SearchViewerRef} from "../viewmodel/searchViewerRef";

const SearchViewerContext = createContext<SearchViewerRef>(new SearchViewerRef());

export const useSearchViewer = () => useContext(SearchViewerContext);
