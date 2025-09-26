import {createContext, useContext, useEffect} from "react";

import {UserPreferences} from "../util/userPreferences";
import {INotificationListener} from "../util/preferencesManager";

const preferences = createContext<UserPreferences>(UserPreferences.Instance);

export const usePreferences = (listener: INotificationListener = null): UserPreferences => {
    const context = useContext(preferences);

    if (listener != null) {
        useEffect(() => {
            context.addListener(listener);

            return () => {
                context.removeListener(listener);
            }
        }, []);
    }

    return context;
};
