import gql from "graphql-tag";

import {QualityControl} from "../models/qualityControl";

export const QualityControlFieldsFragment = gql`fragment QualityControlFields on QualityControl {
    id
    status
}`;

const QualityControlTestFieldsFragment = gql`fragment QualityControlTestFields on QualityControlTest {
    name
    safeName
    description
    nodes
}`;

const QualityOutputFieldsFragment = gql`fragment QualityOutputFields on QualityOutput {
    serviceVersion
    toolVersion
    score
    passed {
        ...QualityControlTestFields
    }
    warnings {
        ...QualityControlTestFields
    }
    errors {
        ...QualityControlTestFields
    }
    toolError {
        kind
        description
        info
    }
    when
}
${QualityControlTestFieldsFragment}
`;

export const QUALITY_CONTROL_DETAIL_QUERY = gql`
    query QualityControlDetail($id: String!) {
        qualityControl(id: $id) {
            id
            status
            current {
                ...QualityOutputFields
            }
            history {
                ...QualityOutputFields
            }
        }
    }
    ${QualityOutputFieldsFragment}
`;

export type QualityControlDetailVariables = {
    id: string;
}

export type QualityControlDetailResponse = {
    qualityControl: QualityControl;
}

export const REASSESS_QUALITY_CONTROL_MUTATION = gql`mutation ReassessQualityControl($reconstructionId: String!) {
    requestQualityControlReassessment(reconstructionId: $reconstructionId) {
        id
        status
    }
}`;

export type ReassessQualityControlVariables = {
    reconstructionId: string;
}

export type ReassessQualityControlResponse = {
    requestQualityControlReassessment: QualityControl;
}
