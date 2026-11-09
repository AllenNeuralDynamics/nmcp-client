export const PageSettingsKeys = {
    candidates: "nmcp:page.candidates",
    reconstructions: "nmcp:page.reconstructions",
    review: "nmcp:page.review",
    addSpecimens: "nmcp:page.addSpecimens",
    admin: "nmcp:page.admin",
    neuron: "nmcp:page.neuron"
} as const;

export const RetiredSettingsKeys = [
    "nmcp:admin.tab",
    "nmcp:sample.page.offset",
    "nmcp:sample.page.limit",
    "nmcp:neuron.page.offset",
    "nmcp:neuron.page.limit",
    "nmcp:neuron.upload.locked.sample",
    "nmcp:reconstruct.neurons.userOnly",
    "review-tab",
    "review-reconstruction-id",
    "nmcp-neuron-active-tab",
    "nmcp-history-show-system-events",
    "nmcp-history-show-details"
];

// Exact names only: a sweep of the nmcp: prefix would also take the search page's viewer.* keys and app.layout.
export function removeRetiredSettings(getStorage: () => Pick<Storage, "removeItem"> = () => window.localStorage): void {
    try {
        const storage = getStorage();

        for (const key of RetiredSettingsKeys) {
            storage.removeItem(key);
        }
    } catch {
        // Blocked storage must never stop the app from loading.
    }
}

export type VersionedSettings = {
    version: number;
}

export type PageSettingsDefinition<T extends VersionedSettings> = {
    key: string;
    defaults: T;

    sanitize?(settings: T): T;
}

export type SettingsChange<T> = (change: (current: T) => T) => void;

type ListKind = "string" | "number";

const listKinds = new WeakMap<readonly unknown[], ListKind>();

// An empty default can't show its element type, so every list in a defaults object is made here and remembers it.
export function stringList<T extends string = string>(...items: T[]): T[] {
    listKinds.set(items, "string");

    return items;
}

export function numberList<T extends number = number>(...items: T[]): T[] {
    listKinds.set(items, "number");

    return items;
}

export function listKind(list: readonly unknown[]): ListKind | undefined {
    return listKinds.get(list);
}

// Relies on the shape conventions: lists are made with stringList or numberList, ranges are objects rather than tuples,
// and a null default marks a nullable id string.
export function normalizeSettings<T>(defaults: T, stored: unknown): T {
    if (defaults === null) {
        return (typeof stored === "string" ? stored : null) as T;
    }

    if (Array.isArray(defaults)) {
        const kind = listKinds.get(defaults);

        return (kind !== undefined && Array.isArray(stored) && stored.every(v => typeof v === kind) ? stored : defaults) as T;
    }

    if (typeof defaults === "object") {
        if (stored === null || typeof stored !== "object" || Array.isArray(stored)) {
            return defaults;
        }

        const result: Record<string, unknown> = {};

        for (const key of Object.keys(defaults)) {
            result[key] = normalizeSettings((defaults as Record<string, unknown>)[key], (stored as Record<string, unknown>)[key]);
        }

        return result as T;
    }

    if (typeof defaults === "number") {
        return (typeof stored === "number" && Number.isFinite(stored) ? stored : defaults) as T;
    }

    return (typeof stored === typeof defaults ? stored : defaults) as T;
}

export function readPageSettings<T extends VersionedSettings>(definition: PageSettingsDefinition<T>, raw: string | null | undefined): T {
    let stored: unknown;

    try {
        stored = raw == null ? undefined : JSON.parse(raw);
    } catch {
        stored = undefined;
    }

    if (stored === null || typeof stored !== "object" || Array.isArray(stored) || (stored as VersionedSettings).version !== definition.defaults.version) {
        return definition.defaults;
    }

    const normalized = normalizeSettings(definition.defaults, stored);

    return definition.sanitize ? definition.sanitize(normalized) : normalized;
}

export function sectionOf<T, K extends keyof T>(update: SettingsChange<T>, key: K): SettingsChange<T[K]> {
    return change => update(current => ({...current, [key]: change(current[key])}) as T);
}

export type PaginationSettings = {
    offset: number;
    limit: number;
}

export const DefaultPagination: PaginationSettings = {offset: 0, limit: 10};

// The range and step of the page-size and visible-row sliders.
export function isPageSize(value: number): boolean {
    return Number.isInteger(value) && value >= 10 && value <= 50 && value % 5 === 0;
}

export function sanitizePagination(pagination: PaginationSettings): PaginationSettings {
    return {
        offset: Number.isInteger(pagination.offset) && pagination.offset >= 0 ? pagination.offset : DefaultPagination.offset,
        limit: isPageSize(pagination.limit) ? pagination.limit : DefaultPagination.limit
    };
}

export function oneOf<T>(value: T, allowed: readonly T[], fallback: T): T {
    return allowed.includes(value) ? value : fallback;
}
