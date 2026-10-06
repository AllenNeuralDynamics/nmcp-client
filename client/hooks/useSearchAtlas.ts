import {createContext, useContext} from "react";

import {AtlasSelection} from "../viewmodel/atlasSelection";

const SearchAtlasContext = createContext<AtlasSelection>(new AtlasSelection());

export const useSearchAtlas = () => useContext(SearchAtlasContext);
