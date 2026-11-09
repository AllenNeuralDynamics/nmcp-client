import {describe, expect, it} from "vitest";

import {
    isFailedRawUploadStatus,
    isRawUploadPending,
    isTerminalRawUploadStatus,
    RawReconstructionUpload,
    RawReconstructionUploadStatus,
    RawUploadInProgressCode,
    RawUploadServiceIssueCode,
    rawUploadStatusColor,
    rawUploadStatusName,
    TerminalRawUploadStatuses
} from "./rawReconstructionUpload";

const R = RawReconstructionUploadStatus;

const members = Object.values(RawReconstructionUploadStatus).filter((v): v is RawReconstructionUploadStatus => typeof v === "number");

const failures = [R.FailedUpload, R.FailedPrecomputed, R.FailedQualityControl, R.ErroredQualityControl, R.FailedQualityControlService];

function attempt(status: RawReconstructionUploadStatus): RawReconstructionUpload {
    return {id: "attempt-1", attemptNumber: 1, status, sourceFilename: "raw.swc", failureMessage: null};
}

describe("RawReconstructionUploadStatus", () => {
    it("mirrors the API's values", () => {
        expect(members).toEqual([100, 200, 300, 320, 400, 410, 420, 500]);
        expect([R.Uploading, R.PendingQualityControl, R.FailedUpload, R.FailedPrecomputed, R.FailedQualityControl,
            R.ErroredQualityControl, R.FailedQualityControlService, R.Accepted]).toEqual([100, 200, 300, 320, 400, 410, 420, 500]);
    });

    it("mirrors the API's terminal statuses", () => {
        expect(TerminalRawUploadStatuses).toEqual([R.FailedUpload, R.FailedPrecomputed, R.FailedQualityControl,
            R.ErroredQualityControl, R.FailedQualityControlService, R.Accepted]);
    });

    it("mirrors the API's error codes", () => {
        expect(RawUploadInProgressCode).toBe(1011);
        expect(RawUploadServiceIssueCode).toBe(1012);
    });

    it.each(members)("names and colors %s", status => {
        expect(rawUploadStatusName(status)).not.toBe("Unknown");
        expect(rawUploadStatusColor(status)).not.toBe("gray");
    });

    it.each(failures)("colors failure %s red", status => {
        expect(rawUploadStatusColor(status)).toBe("red");
    });

    it("colors the unfinished statuses blue and acceptance green", () => {
        expect(rawUploadStatusColor(R.Uploading)).toBe("blue");
        expect(rawUploadStatusColor(R.PendingQualityControl)).toBe("blue");
        expect(rawUploadStatusColor(R.Accepted)).toBe("green");
    });
});

describe("predicates", () => {
    it.each(members)("treats %s as failed only when it is a failure status", status => {
        expect(isFailedRawUploadStatus(status)).toBe(failures.includes(status));
    });

    it.each(members)("treats %s as terminal unless it is unfinished", status => {
        expect(isTerminalRawUploadStatus(status)).toBe(status != R.Uploading && status != R.PendingQualityControl);
    });

    it("treats only a PendingQualityControl attempt as pending", () => {
        for (const status of members) {
            expect(isRawUploadPending(attempt(status))).toBe(status == R.PendingQualityControl);
        }

        expect(isRawUploadPending(undefined)).toBe(false);
        expect(isRawUploadPending(null)).toBe(false);
    });
});
