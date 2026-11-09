import gql from "graphql-tag";

import {AtlasQualityControl} from "../models/atlasQualityControl";
import {AtlasReconstruction} from "../models/atlasReconstruction";
import {QualityOutputFieldsFragment} from "./qualityControl";

export const AtlasQualityControlFieldsFragment = gql`fragment AtlasQualityControlFields on AtlasQualityControl {
    id
    status
}`;

// QualityOutputFieldsFragment already carries the QualityOutputCommonFields definition that history spreads.
export const ATLAS_QUALITY_CONTROL_DETAIL_QUERY = gql`
    query AtlasQualityControlDetail($id: String!) {
        atlasQualityControl(id: $id) {
            id
            status
            current {
                ...QualityOutputFields
            }
            history {
                ...QualityOutputCommonFields
            }
        }
    }
    ${QualityOutputFieldsFragment}
`;

export type AtlasQualityControlDetailVariables = {
    id: string;
}

export type AtlasQualityControlDetailResponse = {
    atlasQualityControl: AtlasQualityControl;
}

export const REASSESS_QUALITY_CONTROL_MUTATION = gql`mutation ReassessQualityControl($annotationId: String!) {
    requestQualityControlReassessment(annotationId: $annotationId) {
        id
        status
    }
}`;

export type ReassessQualityControlVariables = {
    annotationId: string;
}

export type ReassessQualityControlResponse = {
    requestQualityControlReassessment: AtlasReconstruction;
}
