import {useEffect} from "react";

import {querySystemSettings} from "../services/systemService";
import {useSystemConfiguration} from "./useSystemConfiguration";

export const useLoadSystemConfiguration = () => {
    const systemConfiguration = useSystemConfiguration();

    useEffect(() => {
        const fetchSystemInfo = async () => {
            await querySystemSettings(systemConfiguration);
        };

        fetchSystemInfo().then().catch((err) => console.log(err));
    }, []);
};
