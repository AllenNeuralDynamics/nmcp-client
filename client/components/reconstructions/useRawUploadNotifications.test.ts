import {beforeEach, describe, expect, it, vi} from "vitest";
import {act, renderHook} from "@testing-library/react";

import {
    PendingRawUploadPollInterval,
    rawUploadPollInterval,
    ReconstructionsPollInterval,
    resolveTrackedRawUploads,
    TrackedRawUpload,
    useRawUploadNotifications
} from "./useRawUploadNotifications";
import {errorNotification, successNotification} from "../common/NotificationHelper";
import {makeReconstruction} from "../../test/fixtures";
import {AnnotationStatus} from "../../models/annotationStatus";
import {Annotation} from "../../models/annotation";
import {RawReconstructionUpload, RawReconstructionUploadStatus} from "../../models/rawReconstructionUpload";

vi.mock("../common/NotificationHelper");

const R = RawReconstructionUploadStatus;

function attempt(attemptNumber: number, status: RawReconstructionUploadStatus, failureMessage: string = null, annotationId = "rec-1"): RawReconstructionUpload {
    return {id: `attempt-${attemptNumber}`, annotationId, attemptNumber, status, sourceFilename: "raw.swc", failureMessage};
}

function row(latest: RawReconstructionUpload | null, id = "rec-1"): Annotation {
    return {...makeReconstruction({id, status: AnnotationStatus.InProgress}), latestRawReconstructionUpload: latest};
}

function tracked(attemptNumber: number, annotationId = "rec-1"): TrackedRawUpload {
    return {id: `attempt-${attemptNumber}`, annotationId, attemptNumber};
}

function render(annotations: Annotation[] | undefined) {
    return renderHook(({annotations}: { annotations: Annotation[] | undefined }) => useRawUploadNotifications(annotations), {initialProps: {annotations}});
}

const accepted = ["Raw Reconstruction Uploaded", "The raw reconstruction for Neuron rec-1 was accepted."];

const failures = [R.FailedUpload, R.FailedPrecomputed, R.FailedQualityControl, R.ErroredQualityControl, R.FailedQualityControlService];

beforeEach(() => {
    vi.mocked(successNotification).mockClear();
    vi.mocked(errorNotification).mockClear();
});

describe("rawUploadPollInterval", () => {
    it("polls at the usual rate when nothing is pending", () => {
        expect(rawUploadPollInterval(undefined)).toBe(ReconstructionsPollInterval);
        expect(rawUploadPollInterval([])).toBe(ReconstructionsPollInterval);
        expect(rawUploadPollInterval([row(null)])).toBe(ReconstructionsPollInterval);
        expect(rawUploadPollInterval([row(attempt(1, R.Uploading))])).toBe(ReconstructionsPollInterval);
        expect(rawUploadPollInterval([row(attempt(1, R.Accepted))])).toBe(ReconstructionsPollInterval);
    });

    it("polls faster while any loaded attempt is pending", () => {
        expect(rawUploadPollInterval([row(attempt(1, R.Accepted)), row(attempt(1, R.PendingQualityControl, null, "rec-2"), "rec-2")]))
            .toBe(PendingRawUploadPollInterval);
        expect(PendingRawUploadPollInterval).toBe(5000);
        expect(ReconstructionsPollInterval).toBe(10000);
    });
});

describe("resolveTrackedRawUploads", () => {
    it("finishes a tracked attempt that reached a terminal status", () => {
        const latest = attempt(3, R.Accepted);

        expect(resolveTrackedRawUploads([tracked(3)], [row(latest)])).toEqual({finished: [{attempt: latest, neuronLabel: "Neuron rec-1"}], remaining: []});
    });

    it("keeps a tracked attempt that is still pending", () => {
        expect(resolveTrackedRawUploads([tracked(3)], [row(attempt(3, R.PendingQualityControl))])).toEqual({finished: [], remaining: [tracked(3)]});
    });

    it("keeps a tracked attempt whose annotation is not loaded or has no attempt", () => {
        expect(resolveTrackedRawUploads([tracked(3, "rec-2")], [row(attempt(3, R.Accepted))])).toEqual({finished: [], remaining: [tracked(3, "rec-2")]});
        expect(resolveTrackedRawUploads([tracked(3)], [row(null)])).toEqual({finished: [], remaining: [tracked(3)]});
    });

    it("keeps a tracked attempt when the loaded data predates it", () => {
        expect(resolveTrackedRawUploads([tracked(3)], [row(attempt(2, R.Accepted))])).toEqual({finished: [], remaining: [tracked(3)]});
    });

    it("drops a tracked attempt that a newer one superseded", () => {
        expect(resolveTrackedRawUploads([tracked(3)], [row(attempt(4, R.Accepted))])).toEqual({finished: [], remaining: []});
    });
});

describe("useRawUploadNotifications", () => {
    it("announces an accepted attempt once", () => {
        const hook = render([row(attempt(1, R.PendingQualityControl))]);

        act(() => hook.result.current(attempt(1, R.PendingQualityControl)));

        expect(successNotification).not.toHaveBeenCalled();

        hook.rerender({annotations: [row(attempt(1, R.Accepted))]});

        expect(successNotification).toHaveBeenCalledTimes(1);
        expect(successNotification).toHaveBeenCalledWith(...accepted);

        hook.rerender({annotations: [row(attempt(1, R.Accepted))]});

        expect(successNotification).toHaveBeenCalledTimes(1);
        expect(errorNotification).not.toHaveBeenCalled();
    });

    it.each(failures)("announces failure %s with its reason", status => {
        const hook = render([row(attempt(1, R.PendingQualityControl))]);

        act(() => hook.result.current(attempt(1, R.PendingQualityControl)));

        hook.rerender({annotations: [row(attempt(1, status, "The reason."))]});

        expect(errorNotification).toHaveBeenCalledWith("Raw Reconstruction Upload Failed", "The raw reconstruction for Neuron rec-1 was not accepted: The reason.");
        expect(successNotification).not.toHaveBeenCalled();
    });

    it("announces a failure without a reason", () => {
        const hook = render([row(attempt(1, R.PendingQualityControl))]);

        act(() => hook.result.current(attempt(1, R.PendingQualityControl)));

        hook.rerender({annotations: [row(attempt(1, R.FailedQualityControlService, ""))]});

        expect(errorNotification).toHaveBeenCalledWith("Raw Reconstruction Upload Failed", "The raw reconstruction for Neuron rec-1 was not accepted.");
    });

    it("says nothing about an attempt it was not given", () => {
        const hook = render([row(attempt(1, R.PendingQualityControl))]);

        hook.rerender({annotations: [row(attempt(1, R.Accepted))]});

        expect(successNotification).not.toHaveBeenCalled();
        expect(errorNotification).not.toHaveBeenCalled();
    });

    it("waits through data that predates the attempt", () => {
        const hook = render([row(attempt(2, R.Accepted))]);

        act(() => hook.result.current(attempt(3, R.PendingQualityControl)));

        hook.rerender({annotations: [row(attempt(2, R.Accepted))]});

        expect(successNotification).not.toHaveBeenCalled();

        hook.rerender({annotations: [row(attempt(3, R.Accepted))]});

        expect(successNotification).toHaveBeenCalledWith(...accepted);
    });

    it("forgets an attempt a newer one superseded", () => {
        const hook = render([row(attempt(3, R.PendingQualityControl))]);

        act(() => hook.result.current(attempt(3, R.PendingQualityControl)));

        hook.rerender({annotations: [row(attempt(4, R.Accepted))]});
        hook.rerender({annotations: [row(attempt(3, R.Accepted))]});

        expect(successNotification).not.toHaveBeenCalled();
    });

    it("keeps tracking an attempt whose annotation is not loaded", () => {
        const hook = render([row(attempt(1, R.PendingQualityControl, null, "rec-2"), "rec-2")]);

        act(() => hook.result.current(attempt(1, R.PendingQualityControl, null, "rec-2")));

        hook.rerender({annotations: [row(null)]});

        expect(successNotification).not.toHaveBeenCalled();

        hook.rerender({annotations: [row(attempt(1, R.Accepted, null, "rec-2"), "rec-2")]});

        expect(successNotification).toHaveBeenCalledWith("Raw Reconstruction Uploaded", "The raw reconstruction for Neuron rec-2 was accepted.");
    });

    it("announces an attempt already finished when it is tracked", () => {
        const hook = render([row(attempt(1, R.Accepted))]);

        act(() => hook.result.current(attempt(1, R.PendingQualityControl)));

        expect(successNotification).toHaveBeenCalledWith(...accepted);
    });

    it("does nothing without loaded data", () => {
        const hook = render(undefined);

        act(() => hook.result.current(attempt(1, R.PendingQualityControl)));

        hook.rerender({annotations: undefined});

        expect(successNotification).not.toHaveBeenCalled();
        expect(errorNotification).not.toHaveBeenCalled();
    });
});
