import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";

import {renderWithProviders} from "../../test/render";
import {makeReconstruction, makeUser} from "../../test/fixtures";
import {RawReconstructionDetails} from "./RawReconstructionDetails";
import {AnnotationStatus} from "../../models/annotationStatus";
import {Annotation} from "../../models/annotation";
import {RawReconstructionUpload, RawReconstructionUploadStatus} from "../../models/rawReconstructionUpload";

const counts = (total: number) => ({total, soma: 1, path: 0, branch: 0, end: 0});

function attempt(status: RawReconstructionUploadStatus, failureMessage: string = null): RawReconstructionUpload {
    return {
        id: "attempt-2",
        attemptNumber: 2,
        status,
        user: makeUser(0, "annotator"),
        sourceFilename: "raw.swc",
        failureMessage,
        createdAt: new Date(2026, 10, 5, 9, 30),
        updatedAt: new Date(2026, 10, 5, 9, 45)
    };
}

function render(extra: Partial<Annotation>) {
    return renderWithProviders(<RawReconstructionDetails reconstruction={{...makeReconstruction({status: AnnotationStatus.InProgress}), ...extra}}/>);
}

describe("RawReconstructionDetails", () => {
    it("says when there is neither a raw reconstruction nor an attempt", () => {
        render({rawReconstruction: null, latestRawReconstructionUpload: null});

        expect(screen.getByText("No raw reconstruction has been uploaded.")).toBeTruthy();
        expect(screen.getByText("No raw reconstruction uploads have been attempted.")).toBeTruthy();
    });

    it("shows the raw reconstruction and an accepted attempt", () => {
        render({
            rawReconstruction: {id: "raw-1", notes: "first pass", uploadedAt: new Date(2026, 10, 5, 9, 45), nodeCounts: {axon: counts(120), dendrite: counts(34)}},
            latestRawReconstructionUpload: attempt(RawReconstructionUploadStatus.Accepted)
        });

        expect(screen.getByText("120")).toBeTruthy();
        expect(screen.getByText("34")).toBeTruthy();
        expect(screen.getByText("first pass")).toBeTruthy();
        expect(screen.getAllByText("2026-11-05 09:45").length).toBe(2);
        expect(screen.getByText("Accepted")).toBeTruthy();
        expect(screen.getByText("raw.swc")).toBeTruthy();
        expect(screen.getByText("Test User")).toBeTruthy();
        expect(screen.queryByText("Reason")).toBeNull();
    });

    it("shows why the latest attempt failed", () => {
        render({rawReconstruction: null, latestRawReconstructionUpload: attempt(RawReconstructionUploadStatus.FailedUpload, "A soma was not found in the uploaded file.")});

        expect(screen.getByText("Failed Upload")).toBeTruthy();
        expect(screen.getByText("A soma was not found in the uploaded file.")).toBeTruthy();
    });

    it("leaves out the finish time while uploading", () => {
        render({rawReconstruction: null, latestRawReconstructionUpload: attempt(RawReconstructionUploadStatus.Uploading)});

        expect(screen.getByText("Uploading")).toBeTruthy();
        expect(screen.queryByText("Finished")).toBeNull();
    });
});
