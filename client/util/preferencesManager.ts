export type PreferenceType = string | number | boolean | object;

export class PreferencesManager {
    public readonly _haveStorage: boolean;

    readonly _prefix: string = "pref";

    public static get HavePreferences() {
        return typeof(Storage) !== undefined;
    }

    public constructor(prefix: string) {
        this._prefix = prefix;
        this._haveStorage = typeof(Storage) !== undefined;
    }

    ///
    /// Local
    ///

    protected saveLocalValue(key: string, value: PreferenceType): void {
        if (this._haveStorage) {
            this.writeValue(localStorage, key, value);
        }
    }

    protected loadLocalValue<T extends PreferenceType>(key: string, defaultValue: T): T {
        return this._haveStorage ? this.readValue<T>(localStorage, key, defaultValue) : defaultValue;
    }

    ///
    /// Session
    ///

    protected saveSessionValue(key: string, value: PreferenceType): void {
        if (this._haveStorage) {
            this.writeValue(sessionStorage, key, value);
        }
    }

    protected loadSessionValue<T extends PreferenceType>(key: string, defaultValue: T): T {
        return this._haveStorage ? this.readValue<T>(sessionStorage, key, defaultValue) : defaultValue;
    }

    //
    // Internal
    //

    private writeValue(storage: Storage, key: string, value: PreferenceType): void {
        if (typeof value === "string") {
            storage.setItem(this._prefix + key, value);
        } else if (typeof value === "boolean") {
            storage.setItem(this._prefix + key, value.toString());
        } else if (typeof value === "number") {
            storage.setItem(this._prefix + key, value.toFixed(10));
        } else {
            storage.setItem(this._prefix + key, JSON.stringify(value));
        }
    }

    private readValue<T extends PreferenceType>(storage: Storage, key: string, defaultValue: T): T {
        const value = storage.getItem(this._prefix + key);

        if (value === null) {
            return defaultValue;
        }

        if (typeof defaultValue === "string") {
            return value as T;
        } else if (typeof defaultValue === "boolean") {
            return (value === true.toString()) as T;
        } else if (typeof defaultValue === "number") {
            return parseFloat(value) as T;
        } else {
            return JSON.parse(value) as T;
        }
    }
}
