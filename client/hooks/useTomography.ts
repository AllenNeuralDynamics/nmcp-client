import * as React from "react";

import {TomographyCollection} from "../store/system/tomographyCollection";

const tomography = React.createContext<TomographyCollection>(new TomographyCollection())

export const useTomography = () => {
    return React.useContext(tomography);
};
