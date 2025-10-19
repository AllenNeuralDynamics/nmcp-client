import {PreferencesManager} from "./preferencesManager";

const SamplePageOffset = "sample.page.offset";
const SamplePageLimit = "sample.page.limit";
const NeuronPageOffset = "neuron.page.offset";
const NeuronPageLimit = "neuron.page.limit";
const LockedSampleId = "neuron.upload.locked.sample";
const CandidateViewerState = "candidates.viewer.state.v4";
const SearchViewerState = "search.viewer.state.v7";
const ShouldAutoCollapseOnQuery = "viewer.shouldAutoCollapseOnQuery";
const LastQuery = "viewer.lastQuery";
const HideCursorInViewer = "viewer.hideCursorInViewer";
const AdminPageTab = "admin.tab";
const ReconstructionNeuronsUserOnly = "reconstruct.neurons.userOnly";

const AppLayoutState = "app.layout";

export class UserPreferences extends PreferencesManager {
    private static _instance: UserPreferences = null;

    public static get Instance(): UserPreferences {
        if (!this._instance) {
            this._instance = new UserPreferences("nmcp:");
        }

        return this._instance;
    }

    public get samplePageOffset(): number {
        return this.loadLocalValue(SamplePageOffset, 0);
    }

    public set samplePageOffset(offset: number) {
        this.saveLocalValue(SamplePageOffset, offset);
    }

    public get samplePageLimit(): number {
        return this.loadLocalValue(SamplePageLimit, 10);
    }

    public set samplePageLimit(offset: number) {
        this.saveLocalValue(SamplePageLimit, offset);
    }

    public get neuronPageOffset(): number {
        return this.loadLocalValue(NeuronPageOffset, 0);
    }

    public set neuronPageOffset(offset: number) {
        this.saveLocalValue(NeuronPageOffset, offset);
    }

    public get neuronPageLimit(): number {
        return this.loadLocalValue(NeuronPageLimit, 10);
    }

    public set neuronPageLimit(offset: number) {
        this.saveLocalValue(NeuronPageLimit, offset);
    }

    public get neuronCreateLockedSampleId(): string {
        return this.loadLocalValue(LockedSampleId, "");
    }

    public set neuronCreateLockedSampleId(id: string) {
        this.saveLocalValue(LockedSampleId, id);
    }

    public get candidateViewerState(): string {
        return this.loadLocalValue(CandidateViewerState, null);
    }

    public set candidateViewerState(state: string) {
        this.saveLocalValue(CandidateViewerState, state);
    }

    public get searchViewerState(): string {
        return this.loadLocalValue(SearchViewerState, null);
    }

    public set searchViewerState(state: string) {
        this.saveLocalValue(SearchViewerState, state);
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

    public get AdminPageTab(): string {
        return this.loadLocalValue(AdminPageTab, "users");
    }

    public set AdminPageTab(n: string) {
        this.saveLocalValue(AdminPageTab, n);
    }

    public get ReconstructionNeuronsUserOnly(): boolean {
        return this.loadLocalValue(ReconstructionNeuronsUserOnly, false);
    }

    public set ReconstructionNeuronsUserOnly(b: boolean) {
        this.saveLocalValue(ReconstructionNeuronsUserOnly, b);
    }

    public get AppLayoutState(): object {
        return this.loadLocalValue(AppLayoutState, null);
    }

    public set AppLayoutState(obj: object) {
        this.saveLocalValue(AppLayoutState, obj);
    }
}
