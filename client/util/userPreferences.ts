import {PreferencesManager} from "./preferencesManager";
import {UIQueryPredicate} from "../models/uiQueryPredicate";

const SamplePageOffset = "sample.page.offset";
const SamplePageLimit = "sample.page.limit";
const NeuronPageOffset = "neuron.page.offset";
const NeuronPageLimit = "neuron.page.limit";
const LockedSampleId = "neuron.upload.locked.sample";
const CandidateViewerState = "candidates.viewer.state.v3";
const SearchViewerState = "search.viewer.state.v6";
const ShouldAutoCollapseOnQuery = "viewer.shouldAutoCollapseOnQuery";
const ShouldAlwaysShowSoma = "viewer.shouldAlwaysShowSoma";
const ShouldAlwaysShowFullTracing = "viewer.shouldAlwaysShowFullTracing";
const IsNeuronListDocked = "viewer.isNeuronListDocked";
const IsCompartmentListDocked = "viewer.isCompartmentListDocked";
const TracingSelectionHiddenOpacity = "viewer.tracingSelectionHiddenOpacity";
const ZoomSpeed = "viewer.zoomSpeed";
const TracingFetchBatchSize = "viewer.tracingFetchBatchSize";
const QueryHistory = "viewer.queryHistory";
const ViewerBackgroundColor = "viewer.viewerBackgroundColor";
const TracingRadiusFactor = "viewer.tracingRadiusFactor";
const RootCompartmentColor = "viewer.rootCompartmentColor";
const ViewPresets = "viewer.viewPresets";
const HideCursorInViewer = "viewer.hideCursorInViewer";
const HideCursorOnPage = "viewer.hideCursorOnPage";
const ViewerStylePreference = "viewer.viewerStyle";
const AdminPageSelectedTab = "admin.selectedTab";
const ShowReferenceIds = "selection.showReferenceIds";
const ReconstructionNeuronsUserOnly = "reconstruct.neurons.userOnly";

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

    public get candidateViewerState(): any {
        return this.loadLocalValue(CandidateViewerState, null);
    }

    public set candidateViewerState(state: string) {
        this.saveLocalValue(CandidateViewerState, JSON.stringify(state));
    }

    public get searchViewerState(): any {
        return this.loadLocalValue(SearchViewerState, null);
    }

    public set searchViewerState(state: string) {
        this.saveLocalValue(SearchViewerState, JSON.stringify(state));
    }

    public get ShouldAutoCollapseOnQuery() {
        return this.loadLocalValue(ShouldAutoCollapseOnQuery, false);
    }

    public set ShouldAutoCollapseOnQuery(b: boolean) {
        this.saveLocalValue(ShouldAutoCollapseOnQuery, b);
    }

    public get ShouldAlwaysShowSoma() {
        return this.loadLocalValue(ShouldAlwaysShowSoma, true);
    }

    public set ShouldAlwaysShowSoma(b: boolean) {
        this.saveLocalValue(ShouldAlwaysShowSoma, b);
    }

    public get ShouldAlwaysShowFullTracing() {
        return this.loadLocalValue(ShouldAlwaysShowFullTracing, true);
    }

    public set ShouldAlwaysShowFullTracing(b: boolean) {
        this.saveLocalValue(ShouldAlwaysShowFullTracing, b);
    }

    public get IsNeuronListDocked() {
        return this.loadLocalValue(IsNeuronListDocked, true);
    }

    public set IsNeuronListDocked(b: boolean) {
        this.saveLocalValue(IsNeuronListDocked, b);
    }

    public get IsCompartmentListDocked() {
        return this.loadLocalValue(IsCompartmentListDocked, true);
    }

    public set IsCompartmentListDocked(b: boolean) {
        this.saveLocalValue(IsCompartmentListDocked, b);
    }

    public get TracingSelectionHiddenOpacity() {
        return this.loadLocalValue(TracingSelectionHiddenOpacity, 0.0);
    }

    public set TracingSelectionHiddenOpacity(n: number) {
        this.saveLocalValue(TracingSelectionHiddenOpacity, n);
    }

    public get ZoomSpeed() {
        return this.loadLocalValue(ZoomSpeed, 1.0);
    }

    public get TracingFetchBatchSize() {
        return this.loadLocalValue(TracingFetchBatchSize, 10.0);
    }

    public set TracingFetchBatchSize(n: number) {
        this.saveLocalValue(TracingFetchBatchSize, n);
    }

    public get LastQuery(): UIQueryPredicate[] {
        const query = this.loadLocalValue(QueryHistory, null);

        if (query) {
            return query.filters;
        }

        return null;
    }

    public AppendQueryHistory(filters: UIQueryPredicate[]) {
        const obj = {
            timestamp: new Date(),
            filters: filters.map(f => f.serialize())
        };

        this.saveLocalValue(QueryHistory, JSON.stringify(obj));
    }

    public get ViewerBackgroundColor() {
        return this.loadLocalValue(ViewerBackgroundColor, "#FFFFFF");
    }

    public set ViewerBackgroundColor(n: string) {
        this.saveLocalValue(ViewerBackgroundColor, n);

        this.notifyListeners("viewerBackgroundColor", n);
    }

    public get TracingRadiusFactor() {
        return this.loadLocalValue(TracingRadiusFactor, 1.0);
    }

    public get RootCompartmentColor() {
        return this.loadLocalValue(RootCompartmentColor, "888888");
    }

    public get ViewPresets(): any[] {
        return JSON.parse(this.loadLocalValue(ViewPresets, JSON.stringify([])));
    }

    public get HideCursorInViewer(): boolean {
        return this.loadLocalValue(HideCursorInViewer, false);
    }

    public get HideCursorOnPage(): boolean {
        return this.loadLocalValue(HideCursorOnPage, false);
    }

    public get AdminPageSelectedTab(): number {
        return this.loadLocalValue(AdminPageSelectedTab, 0);
    }

    public set AdminPageSelectedTab(n: number) {
        this.saveLocalValue(AdminPageSelectedTab, n.valueOf().toFixed(0));

        this.notifyListeners("adminPageSelectedTab", n);
    }

    public get ShowReferenceIds(): boolean {
        return this.loadLocalValue(ShowReferenceIds, false);
    }

    public set ShowReferenceIds(b: boolean) {
        this.saveLocalValue(ShowReferenceIds, b);

        this.notifyListeners("showReferenceIds", b);
    }

    public get ReconstructionNeuronsUserOnly(): boolean {
        return this.loadLocalValue(ReconstructionNeuronsUserOnly, false);
    }

    public set ReconstructionNeuronsUserOnly(b: boolean) {
        this.saveLocalValue(ReconstructionNeuronsUserOnly, b);

        this.notifyListeners("reconstructionNeuronsUserOnly", b);
    }


    protected validateDefaultPreferences() {
        this.setDefaultLocalValue(SamplePageOffset, 0);
        this.setDefaultLocalValue(SamplePageLimit, 10);
        this.setDefaultLocalValue(NeuronPageOffset, 0);
        this.setDefaultLocalValue(NeuronPageLimit, 10);
        this.setDefaultLocalValue(LockedSampleId, "");
        this.setDefaultLocalValue(CandidateViewerState, null);
        this.setDefaultLocalValue(ShouldAutoCollapseOnQuery, false);
        this.setDefaultLocalValue(ShouldAlwaysShowSoma, true);
        this.setDefaultLocalValue(ShouldAlwaysShowFullTracing, true);
        this.setDefaultLocalValue(IsNeuronListDocked, true);
        this.setDefaultLocalValue(IsCompartmentListDocked, true);
        this.setDefaultLocalValue(TracingSelectionHiddenOpacity, 0.0);
        this.setDefaultLocalValue(ZoomSpeed, 1.0);
        this.setDefaultLocalValue(TracingFetchBatchSize, 10.0);
        this.setDefaultLocalValue(ViewerBackgroundColor, "#FFFFFF");
        this.setDefaultLocalValue(TracingRadiusFactor, 1.0);
        this.setDefaultLocalValue(RootCompartmentColor, "888888");
        this.setDefaultLocalValue(ViewPresets, []);
        this.setDefaultLocalValue(HideCursorInViewer, false);
        this.setDefaultLocalValue(HideCursorOnPage, false);
        this.setDefaultLocalValue(AdminPageSelectedTab, 0);
        this.setDefaultLocalValue(ShowReferenceIds, false);
    }
}
