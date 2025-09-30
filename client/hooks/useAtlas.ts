import {createContext, useContext} from "react";

import {AtlasViewModel} from "../viewmodel/atlasViewModel";

const AtlasContext = createContext<AtlasViewModel>(new AtlasViewModel())

export const useAtlas = () => useContext(AtlasContext);
