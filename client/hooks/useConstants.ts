import {useContext} from "react";

import {ConstantsContext} from "../components/app/AppConstants";

export const useConstants = () => useContext(ConstantsContext);
