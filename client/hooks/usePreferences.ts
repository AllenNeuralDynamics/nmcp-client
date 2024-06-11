import {useEffect} from "react";

import {UserPreferences} from "../util/userPreferences";
import {INotificationListener} from "../util/preferencesManager";

export const usePreferences = (listener: INotificationListener) => {
    useEffect(() => {
        UserPreferences.Instance.addListener(listener);

        return () => {
            UserPreferences.Instance.removeListener(listener);

        }
    }, []);
};
