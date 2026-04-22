export type DominantStructure = {
    atlasStructureId: string;
}

export type StructureNodeCountEntry = {
    atlasStructureId: string;
    nodeCount: number;
    pathCount: number;
    branchCount: number;
    endCount: number;
    nodePercentage: number;
}

export type StructureLengthEntry = {
    atlasStructureId: string;
    totalLengthMicrometer: number;
    axonLengthMicrometer: number;
    dendriteLengthMicrometer: number;
    totalLengthPercentage: number;
    axonLengthPercentage: number;
    dendriteLengthPercentage: number;
}

export type NodeCountMetrics = {
    totalNodeCount: number;
    totalPathCount: number;
    totalBranchCount: number;
    totalEndCount: number;
    totalAxonNodeCount: number;
    totalAxonPathCount: number;
    totalAxonBranchCount: number;
    totalAxonEndCount: number;
    totalDendriteNodeCount: number;
    totalDendritePathCount: number;
    totalDendriteBranchCount: number;
    totalDendriteEndCount: number;
    byStructure: StructureNodeCountEntry[];
    dominantNodeStructures: DominantStructure[];
    dominantAxonNodeStructures: DominantStructure[];
    dominantDendriteNodeStructures: DominantStructure[];
}

export type LengthMetrics = {
    totalLengthMicrometer: number;
    totalAxonLengthMicrometer: number;
    totalDendriteLengthMicrometer: number;
    byStructure: StructureLengthEntry[];
    dominantLengthStructures: DominantStructure[];
    dominantAxonLengthStructures: DominantStructure[];
    dominantDendriteLengthStructures: DominantStructure[];
}

export type DetailedMetricsEntry = {
    atlasStructureId: string;
    neuronStructureId: string;
    nodeCount: number;
    pathCount: number;
    branchCount: number;
    endCount: number;
    totalLengthMicrometer: number;
    axonLengthMicrometer: number;
    dendriteLengthMicrometer: number;
    nodePercentage: number;
    totalLengthPercentage: number;
    axonLengthPercentage: number;
    dendriteLengthPercentage: number;
}

export type ReconstructionMetrics = {
    reconstructionId: string;
    nodeCounts: NodeCountMetrics;
    lengths: LengthMetrics;
    detailedEntries: DetailedMetricsEntry[];
}
