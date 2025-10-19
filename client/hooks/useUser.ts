import {useContext} from "react";

import {UserContext} from "../components/app/UserApp";

export const useUser = () => useContext(UserContext);
