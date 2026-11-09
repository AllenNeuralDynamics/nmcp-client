import {useCallback, useLayoutEffect, useRef} from "react";
import {useLocalStorage} from "@mantine/hooks";

import {PageSettingsDefinition, readPageSettings, SettingsChange, VersionedSettings} from "../util/pageSettings";

// One call per page, in the page's root component; its parts receive slices through sectionOf.  definition.defaults must
// be a module-level constant, since Mantine depends on its identity.
export function usePageSettings<T extends VersionedSettings>(definition: PageSettingsDefinition<T>): [T, SettingsChange<T>] {
    const [value, setValue] = useLocalStorage<T>({
        key: definition.key,
        defaultValue: definition.defaults,
        // The page's first query must already use the restored values.
        getInitialValueInEffect: false,
        sync: false,
        deserialize: raw => readPageSettings(definition, raw)
    });

    const latest = useRef(value);

    useLayoutEffect(() => {
        latest.current = value;
    }, [value]);

    // Not Mantine's functional form: it computes inside React's state updater, so updates children queue while the page
    // mounts are overwritten by useLocalStorage's mount effect, which re-reads storage.  Computing from the latest value
    // and passing a plain object writes storage before that effect reads it.
    const update = useCallback<SettingsChange<T>>(change => {
        const next = change(latest.current);

        latest.current = next;

        setValue(next);
    }, [setValue]);

    return [value, update];
}
