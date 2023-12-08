import {useEffect} from "react";

import {INotificationListener, PreferencesManager} from "../util/preferencesManager";

export const usePreferences = (listener: INotificationListener) => {
    useEffect(() => {
        PreferencesManager.Instance.addListener(listener);

        return () => {
            PreferencesManager.Instance.removeListener(listener);

        }
    }, []);
};
