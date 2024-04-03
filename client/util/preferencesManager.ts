import {UIQueryPredicate} from "../models/uiQueryPredicate";
import { ViewerMeshVersion } from "../models/compartmentMeshSet";


export interface INotificationListener {
    preferenceChanged(name: string);
}

const prefix = "jne:";

export class PreferencesManager {

    private static _instance = null;

    private _notificationListeners: INotificationListener[] = [];

    public static get Instance(): PreferencesManager {
        if (!this._instance) {
            this._instance = new PreferencesManager();
        }

        return this._instance;
    }

    public static get HavePreferences() {
        return typeof(Storage) !== undefined;
    }

    public constructor() {
        this.validateDefaultSettings();

        if (typeof(Storage) !== undefined) {
            window.addEventListener("storage", (e) => {
                if (e.key && e.key.startsWith(prefix)) {
                    this.notifyListeners(e.key.substring(prefix.length), null);
                }
            });
        }
    }

    public addListener(listener: INotificationListener) {
        if (this._notificationListeners.indexOf(listener) === -1) {
            this._notificationListeners.push(listener);
        }
    }

    public removeListener(listener: INotificationListener) {
        this._notificationListeners = this._notificationListeners.filter(n => n !== listener);
    }

    private notifyListeners(name: string, value: any) {
        this._notificationListeners.map(n => {
            n.preferenceChanged(name);
        })
    }

    public get ShouldUseUpdatedLayout() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "shouldUseUpdatedLayout") === "true";
        } else {
            return false;
        }
    }

    public get ShouldAutoCollapseOnQuery() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "shouldAutoCollapseOnQuery") === "true";
        } else {
            return false;
        }
    }

    public set ShouldAutoCollapseOnQuery(b: boolean) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "shouldAutoCollapseOnQuery", b ? "true" : "false");
        }
    }

    public get ShouldAlwaysShowSoma() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "shouldAlwaysShowSoma") === "true";
        } else {
            return false;
        }
    }

    public set ShouldAlwaysShowSoma(b: boolean) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "shouldAlwaysShowSoma", b ? "true" : "false");
        }
    }

    public get ShouldAlwaysShowFullTracing() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "shouldAlwaysShowFullTracing") === "true";
        } else {
            return false;
        }
    }

    public set ShouldAlwaysShowFullTracing(b: boolean) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "shouldAlwaysShowFullTracing", b ? "true" : "false");
        }
    }

    public get IsNeuronListDocked() {
        if (typeof(Storage) !== undefined) {
            return sessionStorage.getItem(prefix + "isNeuronListDocked") === "true";
        } else {
            return true;
        }
    }

    public set IsNeuronListDocked(b: boolean) {
        if (typeof(Storage) !== undefined) {
            sessionStorage.setItem(prefix + "isNeuronListDocked", b ? "true" : "false");
        }
    }

    public get IsCompartmentListDocked() {
        if (typeof(Storage) !== undefined) {
            return sessionStorage.getItem(prefix + "isCompartmentListDocked") === "true";
        } else {
            return true;
        }
    }

    public set IsCompartmentListDocked(b: boolean) {
        if (typeof(Storage) !== undefined) {
            sessionStorage.setItem(prefix + "isCompartmentListDocked", b ? "true" : "false");
        }
    }

    public get TracingSelectionHiddenOpacity() {
        if (typeof(Storage) !== undefined) {
            return parseFloat(localStorage.getItem(prefix + "tracingSelectionHiddenOpacity"));
        } else {
            return 0.0;
        }
    }

    public set TracingSelectionHiddenOpacity(n: number) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "tracingSelectionHiddenOpacity", n.toFixed(2));
        }
    }

    public get ZoomSpeed() {
        if (typeof(Storage) !== undefined) {
            return parseFloat(localStorage.getItem(prefix + "zoomSpeed"));
        } else {
            return 1.0;
        }
    }

    public set ZoomSpeed(n: number) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "zoomSpeed", n.toFixed(1));
        }
    }

    public get TracingFetchBatchSize() {
        if (typeof(Storage) !== undefined) {
            return parseInt(localStorage.getItem(prefix + "tracingFetchBatchSize"));
        } else {
            return 0.0;
        }
    }

    public set TracingFetchBatchSize(n: number) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "tracingFetchBatchSize", n.toFixed(0));
        }
    }

    public AppendQueryHistory(filters: UIQueryPredicate[]) {
        if (typeof(Storage) !== undefined) {
            const obj = {
                timestamp: new Date(),
                filters: filters.map(f => f.serialize())
            };

            localStorage.setItem(prefix + "queryHistory", JSON.stringify(obj));
        }
    }

    public get LastQuery(): UIQueryPredicate[] {
        if (typeof(Storage) !== undefined) {
            const str = localStorage.getItem(prefix + "queryHistory");

            if (str) {
                const obj = JSON.parse(str);

                return obj.filters;
            }
        }

        return null;
    }

    public get ViewerBackgroundColor() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "viewerBackgroundColor");
        } else {
            return "#FFFFFF";
        }
    }

    public set ViewerBackgroundColor(n: string) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "viewerBackgroundColor", n);
        }

        this.notifyListeners("viewerBackgroundColor", n);
    }

    public get ViewerMeshVersion(): ViewerMeshVersion {
            return ViewerMeshVersion.AibsCcf;
    }

    public set ViewerMeshVersion(n: ViewerMeshVersion) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "viewerMeshVersion", n.valueOf().toFixed(0));
        }

        this.notifyListeners("viewerMeshVersion", n);
    }

    public get TracingRadiusFactor() {
        if (typeof(Storage) !== undefined) {
            return parseInt(localStorage.getItem(prefix + "tracingRadiusFactor"));
        } else {
            return 1.0;
        }
    }

    public get RootCompartmentColor() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "rootCompartmentColor");
        } else {
            return "FFFFFF";
        }
    }

    public get ViewPresets(): any[] {
        if (typeof(Storage) !== undefined) {
            return JSON.parse(localStorage.getItem(prefix + "viewPresets"));
        } else {
            return [];
        }
    }

    public get HideCursorInViewer(): boolean {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "hideCursorInViewer") === true.toString();
        } else {
            return false;
        }
    }

    public get HideCursorOnPage(): boolean {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "hideCursorOnPage") === true.toString();
        } else {
            return false;
        }
    }

    private validateDefaultSettings() {
        if (typeof(Storage) !== undefined) {
            if (!localStorage.getItem(prefix + "shouldAutoCollapseOnQuery")) {
                localStorage.setItem(prefix + "shouldAutoCollapseOnQuery", "false");
            }

            if (!localStorage.getItem(prefix + "shouldAlwaysShowSoma")) {
                localStorage.setItem(prefix + "shouldAlwaysShowSoma", "true");
            }

            if (!localStorage.getItem(prefix + "shouldAlwaysShowFullTracing")) {
                localStorage.setItem(prefix + "shouldAlwaysShowFullTracing", "true");
            }

            if (!sessionStorage.getItem(prefix + "isNeuronListDocked")) {
                sessionStorage.setItem(prefix + "isNeuronListDocked", "true");
            }

            if (!sessionStorage.getItem(prefix + "isCompartmentListDocked")) {
                sessionStorage.setItem(prefix + "isCompartmentListDocked", "true");
            }

            if (!localStorage.getItem(prefix + "tracingFetchBatchSize")) {
                localStorage.setItem(prefix + "tracingFetchBatchSize", "10.0");
            }

            if (!localStorage.getItem(prefix + "tracingSelectionHiddenOpacity")) {
                localStorage.setItem(prefix + "tracingSelectionHiddenOpacity", "0.0");
            }

            if (!localStorage.getItem(prefix + "viewerBackgroundColor")) {
                localStorage.setItem(prefix + "viewerBackgroundColor", "#FFFFFF");
            }

            if (!localStorage.getItem(prefix + "tracingRadiusFactor")) {
                localStorage.setItem(prefix + "tracingRadiusFactor", "1.0");
            }

            if (!localStorage.getItem(prefix + "rootCompartmentColor")) {
                localStorage.setItem(prefix + "rootCompartmentColor", "888888");
            }

            if (!localStorage.getItem(prefix + "viewPresets")) {
                localStorage.setItem(prefix + "viewPresets", JSON.stringify([]));
            }

            if (!localStorage.getItem(prefix + "hideCursorInViewer")) {
                localStorage.setItem(prefix + "hideCursorInViewer", false.toString());
            }

            if (!localStorage.getItem(prefix + "hideCursorOnPage")) {
                localStorage.setItem(prefix + "hideCursorOnPage", false.toString());
            }

            if (!localStorage.getItem(prefix + "zoomSpeed")) {
                localStorage.setItem(prefix + "zoomSpeed", "1.0");
            }

            if (!localStorage.getItem(prefix + "viewerMeshVersion")) {
                localStorage.setItem(prefix + "viewerMeshVersion", ViewerMeshVersion.Janelia.valueOf().toFixed(0));
            }
        }
    }
}
