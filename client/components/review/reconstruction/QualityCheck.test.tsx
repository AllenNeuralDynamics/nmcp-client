import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";

import {renderWithProviders} from "../../../test/render";
import {makeReconstruction, makeUser} from "../../../test/fixtures";
import {ATLAS_QUALITY_CONTROL_DETAIL_QUERY} from "../../../graphql/atlasQualityControl";
import {UserPermissions} from "../../../graphql/user";
import {AnnotationStatus} from "../../../models/annotationStatus";
import {AtlasReconstructionStatus} from "../../../models/atlasReconstructionStatus";
import {AtlasQualityControlStatus} from "../../../models/atlasQualityControlStatus";
import {QualityOutput} from "../../../models/qualityControl";
import {QualityCheck} from "./QualityCheck";
import {v3Data} from "../../../test/qualityControlFixtures";

const publishReviewer = makeUser(UserPermissions.PublishReview, "publish");
const peerReviewer = makeUser(UserPermissions.PeerReview, "peer");

const v2Output: QualityOutput & { __typename: string } = {
    __typename: "QualityOutput",
    serviceVersion: 2,
    toolVersion: "0.5.1",
    when: null,
    data: {errors: [{name: "Dangling Nodes", description: "Nodes without a parent", nodes: [1, 2]}]}
};

function reconstruction(status: AnnotationStatus, childStatus: AtlasReconstructionStatus, qcStatus: AtlasQualityControlStatus) {
    const base = makeReconstruction({status, childStatus});

    return {...base, atlasReconstruction: {...base.atlasReconstruction, qualityControl: {id: "qc-1", status: qcStatus}}};
}

function detailMock(status: AtlasQualityControlStatus, current: QualityOutput & { __typename: string } | null) {
    return [{
        request: {query: ATLAS_QUALITY_CONTROL_DETAIL_QUERY, variables: {id: "qc-1"}},
        result: {data: {atlasQualityControl: {__typename: "AtlasQualityControl", id: "qc-1", status, current, history: []}}}
    }];
}

describe("QualityCheck", () => {
    it("offers reassessment after a failed quality check", async () => {
        renderWithProviders(<QualityCheck isActive={true}
                                          reconstruction={reconstruction(AnnotationStatus.WaitingForAtlasReconstruction, AtlasReconstructionStatus.FailedQualityControl, AtlasQualityControlStatus.Failed)}/>, {
            user: publishReviewer,
            mocks: detailMock(AtlasQualityControlStatus.Failed, v2Output)
        });

        expect(await screen.findByText("Dangling Nodes")).toBeTruthy();
        expect(screen.getByText("Errors")).toBeTruthy();
        expect(screen.getByRole("button", {name: "Assess Again"})).toBeEnabled();
    });

    it("puts reassessment at the far right, after the grouping control", async () => {
        renderWithProviders(<QualityCheck isActive={true}
                                          reconstruction={reconstruction(AnnotationStatus.WaitingForAtlasReconstruction, AtlasReconstructionStatus.FailedQualityControl, AtlasQualityControlStatus.Failed)}/>, {
            user: publishReviewer,
            mocks: detailMock(AtlasQualityControlStatus.Failed, {__typename: "QualityOutput", serviceVersion: 3, toolVersion: "1.0.2", when: null, data: v3Data})
        });

        const groupBy = await screen.findByRole("textbox", {name: "Group by"});
        const assessAgain = screen.getByRole("button", {name: "Assess Again"});

        expect(groupBy.compareDocumentPosition(assessAgain) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(screen.getByText("Standard Morph version: 1.0.2").compareDocumentPosition(groupBy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("hides reassessment once the reconstruction is ready to publish", async () => {
        renderWithProviders(<QualityCheck isActive={true}
                                          reconstruction={reconstruction(AnnotationStatus.ReadyToPublish, AtlasReconstructionStatus.ReadyToPublish, AtlasQualityControlStatus.Passed)}/>, {
            user: publishReviewer,
            mocks: detailMock(AtlasQualityControlStatus.Passed, v2Output)
        });

        expect(await screen.findByText("Dangling Nodes")).toBeTruthy();
        expect(screen.queryByRole("button", {name: "Assess Again"})).toBeNull();
    });

    it("hides reassessment while quality control is running", async () => {
        renderWithProviders(<QualityCheck isActive={true}
                                          reconstruction={reconstruction(AnnotationStatus.WaitingForAtlasReconstruction, AtlasReconstructionStatus.InQualityControl, AtlasQualityControlStatus.InProgress)}/>, {
            user: publishReviewer,
            mocks: detailMock(AtlasQualityControlStatus.InProgress, null)
        });

        expect(await screen.findByText("In Progress")).toBeTruthy();
        expect(screen.queryByRole("button", {name: "Assess Again"})).toBeNull();
    });

    it("hides reassessment from a user who cannot operate the pipeline", async () => {
        renderWithProviders(<QualityCheck isActive={true}
                                          reconstruction={reconstruction(AnnotationStatus.WaitingForAtlasReconstruction, AtlasReconstructionStatus.FailedQualityControl, AtlasQualityControlStatus.Failed)}/>, {
            user: peerReviewer,
            mocks: detailMock(AtlasQualityControlStatus.Failed, v2Output)
        });

        expect(await screen.findByText("Dangling Nodes")).toBeTruthy();
        expect(screen.queryByRole("button", {name: "Assess Again"})).toBeNull();
    });
});
