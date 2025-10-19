import gql from "graphql-tag";
import {QualityControlStatus} from "../models/qualityControlStatus";
import {OldQualityControl} from "../models/qualityControl";

export const AtlasReconstructionFieldsFragment = gql`fragment AtlasReconstructionFields on AtlasReconstruction {
    id
    sourceUrl
    status
    lengthMillimeters
    reviewer {
        id
        firstName
        lastName
    }
}`;

// Request Quality Check Mutation
export const QUALITY_CHECK_MUTATION = gql`mutation QualityCheck($id: String!) {
    requestQualityCheck(id: $id) {
        id
        qualityCheckStatus
        qualityCheck {
            warnings {
                testName
                testDescription
                affectedNodes
            }
            errors {
                testName
                testDescription
                affectedNodes
            }
        }
        qualityCheckAt
        error {
            kind
            message
        }
    }
}`;

export type QualityCheckVariables = {
    id: string;
}

export type QualityCheckResponse = {
    requestQualityCheck: {
        id: string,
        qualityCheckStatus: QualityControlStatus,
        qualityCheck: OldQualityControl;
        qualityCheckAt: Date;
        error: { name: string, message: string }
    };
}

