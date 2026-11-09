import {PreferencesManager} from "./preferencesManager";

const ShouldAutoCollapseOnQuery = "viewer.shouldAutoCollapseOnQuery";
const LastQuery = "viewer.lastQuery";
const HideCursorInViewer = "viewer.hideCursorInViewer";

const AppLayoutState = "app.layout";

export class UserPreferences extends PreferencesManager {
    private static _instance: UserPreferences = null;

    public static get Instance(): UserPreferences {
        if (!this._instance) {
            this._instance = new UserPreferences("nmcp:");
        }

        return this._instance;
    }

    public get ShouldAutoCollapseOnQuery() {
        return this.loadLocalValue(ShouldAutoCollapseOnQuery, false);
    }

    public set ShouldAutoCollapseOnQuery(b: boolean) {
        this.saveLocalValue(ShouldAutoCollapseOnQuery, b);
    }

    public get LastQuery(): object[] {
        return this.loadLocalValue(LastQuery, []);
    }

    public set LastQuery(filters: object[]) {
        this.saveLocalValue(LastQuery, JSON.stringify(filters));
    }

    public get HideCursorInViewer(): boolean {
        return this.loadLocalValue(HideCursorInViewer, false);
    }

    public get AppLayoutState(): object {
        return this.loadLocalValue(AppLayoutState, null);
    }

    public set AppLayoutState(obj: object) {
        this.saveLocalValue(AppLayoutState, obj);
    }
}
