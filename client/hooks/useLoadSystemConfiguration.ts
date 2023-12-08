import {useEffect} from "react";

import {querySystemSettings} from "../services/systemService";

export const useLoadSystemConfiguration = () => {
    useEffect(() => {
        const fetchSystemInfo = async () => {
            await querySystemSettings();
        };

        fetchSystemInfo().then().catch((err) => console.log(err));
    }, []);
};
