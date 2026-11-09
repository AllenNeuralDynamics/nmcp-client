import * as React from "react";
import {useState} from "react";

import {SettingsChange} from "../util/pageSettings";

type HarnessProps<T> = {
    initial: T;
    latest: { current: T };

    children(settings: T, onSettingsChange: SettingsChange<T>): React.ReactElement;
}

// Holds a page-settings section in state for a component that receives one, recording each new value in latest.
export function SettingsHarness<T>({initial, latest, children}: HarnessProps<T>) {
    const [settings, setSettings] = useState(initial);

    latest.current = settings;

    return children(settings, setSettings);
}
