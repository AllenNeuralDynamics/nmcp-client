import {rootDataStore} from "../store/system/systemDataStore";

export const querySystemSettings = async (): Promise<void> => {
    const resp = await fetch('/system', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    try {
        if (resp.status === 200) {
            rootDataStore.SystemConfiguration.update(await resp.json());
        } else {
            setTimeout(() => querySystemSettings(), 10000);
        }
    } catch (err) {
        setTimeout(() => querySystemSettings(), 10000);
    }
};
