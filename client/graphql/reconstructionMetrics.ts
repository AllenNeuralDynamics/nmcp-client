import gql from "graphql-tag";

import {ReconstructionMetrics} from "../models/reconstructionMetrics";

export const RECONSTRUCTION_METRICS_QUERY = gql`
    query ReconstructionMetrics($id: String!) {
        reconstructionMetrics(id: $id) {
            reconstructionId
            nodeCounts {
                totalNodeCount
                totalPathCount
                totalBranchCount
                totalEndCount
                totalAxonNodeCount
                totalAxonPathCount
                totalAxonBranchCount
                totalAxonEndCount
                totalDendriteNodeCount
                totalDendritePathCount
                totalDendriteBranchCount
                totalDendriteEndCount
                byStructure {
                    atlasStructureId
                    nodeCount
                    pathCount
                    branchCount
                    endCount
                    nodePercentage
                }
                dominantNodeStructures { atlasStructureId }
                dominantAxonNodeStructures { atlasStructureId }
                dominantDendriteNodeStructures { atlasStructureId }
            }
            lengths {
                totalLengthMicrometer
                totalAxonLengthMicrometer
                totalDendriteLengthMicrometer
                byStructure {
                    atlasStructureId
                    totalLengthMicrometer
                    axonLengthMicrometer
                    dendriteLengthMicrometer
                    totalLengthPercentage
                    axonLengthPercentage
                    dendriteLengthPercentage
                }
                dominantLengthStructures { atlasStructureId }
                dominantAxonLengthStructures { atlasStructureId }
                dominantDendriteLengthStructures { atlasStructureId }
            }
            detailedEntries {
                atlasStructureId
                neuronStructureId
                nodeCount
                pathCount
                branchCount
                endCount
                totalLengthMicrometer
                axonLengthMicrometer
                dendriteLengthMicrometer
                nodePercentage
                totalLengthPercentage
                axonLengthPercentage
                dendriteLengthPercentage
            }
        }
    }
`;

export type ReconstructionMetricsQueryVariables = {
    id: string;
}

export type ReconstructionMetricsQueryResponse = {
    reconstructionMetrics: ReconstructionMetrics;
}
