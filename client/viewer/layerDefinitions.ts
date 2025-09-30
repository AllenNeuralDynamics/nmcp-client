export type SearchLayer = {
    name: string;
    index: number;
    source: string;
    isMirror: boolean;
}

export class SearchLayers {
    public CandidateCcfLayer: SearchLayer;
    public CandidateAnnotationLayer: SearchLayer;
    public CandidateReconstructionLayer: SearchLayer;

    public SearchCcfLayer: SearchLayer;
    public SearchSomaAnnotationLayer: SearchLayer;
    public SearchReconstructionLayer: SearchLayer;
    public SearchReconstructionMirrorLayer: SearchLayer;
    public SearchAxonLayer: SearchLayer;
    public SearchAxonMirrorLayer: SearchLayer;
    public SearchDendritesLayer: SearchLayer;
    public SearchDendritesMirrorLayer: SearchLayer;

    public SearchSelectionLayers: SearchLayer[];

    public constructor(precomputedUrl: string) {
        this.CandidateCcfLayer = {name: "CCF", index: 0, isMirror: false, source: "precomputed://gs://allen_neuroglancer_ccf/ccf_test1"};
        this.CandidateAnnotationLayer = {name: "Candidates", index: 1, isMirror: false, source: "local://annotations"};
        this.CandidateReconstructionLayer = {name: "Pending Reconstructions", index: 2, isMirror: false, source: `${precomputedUrl}/candidates`};

        this.SearchCcfLayer = {name: "CCF", index: 0, isMirror: false, source: "precomputed://gs://allen_neuroglancer_ccf/ccf_test1"};
        this.SearchSomaAnnotationLayer = {name: "Soma", index: 1, isMirror: false, source: "local://annotations"};
        this.SearchReconstructionLayer = {name: "Reconstruction", index: 2, isMirror: false, source: `${precomputedUrl}/full`};
        this.SearchReconstructionMirrorLayer = {name: "Reconstruction Mirror", index: 3, isMirror: true, source: `${precomputedUrl}/full`};
        this.SearchAxonLayer = {name: "Axon", index: 4, isMirror: false, source: `${precomputedUrl}/axon`};
        this.SearchAxonMirrorLayer = {name: "Axon Mirror", index: 5, isMirror: true, source: `${precomputedUrl}/axon`};
        this.SearchDendritesLayer = {name: "Dendrite", index: 6, isMirror: false, source: `${precomputedUrl}/dendrite`};
        this.SearchDendritesMirrorLayer = {name: "Dendrite Mirror", index: 7, isMirror: true, source: `${precomputedUrl}/dendrite`};

        this.SearchSelectionLayers = [this.SearchReconstructionLayer, this.SearchReconstructionMirrorLayer, this.SearchAxonLayer, this.SearchAxonMirrorLayer, this.SearchDendritesLayer, this.SearchDendritesMirrorLayer];
    }
}
