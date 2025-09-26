import {SystemConfiguration} from "../store/system/systemConfiguration";

export const querySystemSettings = async (systemConfiguration: SystemConfiguration): Promise<void> => {
    const resp = await fetch('/system', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    try {
        if (resp.status === 200) {
            systemConfiguration.update(await resp.json());
        } else {
            setTimeout(() => querySystemSettings(systemConfiguration), 10000);
        }
    } catch (err) {
        setTimeout(() => querySystemSettings(systemConfiguration), 10000);
    }
};
