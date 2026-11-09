import {useCallback, useEffect, useState} from "react";

import {Annotation} from "../../models/annotation";
import {
    isFailedRawUploadStatus,
    isRawUploadPending,
    isTerminalRawUploadStatus,
    RawReconstructionUpload,
    RawReconstructionUploadStatus
} from "../../models/rawReconstructionUpload";
import {errorNotification, successNotification} from "../common/NotificationHelper";

// Milliseconds, like Apollo's pollInterval.
export const ReconstructionsPollInterval = 10000;

export const PendingRawUploadPollInterval = 5000;

export type TrackedRawUpload = {
    id: string;
    annotationId: string;
    attemptNumber: number;
};

export type FinishedRawUpload = {
    attempt: RawReconstructionUpload;
    neuronLabel: string;
};

export function rawUploadPollInterval(annotations?: Annotation[]): number {
    return annotations?.some(a => isRawUploadPending(a.latestRawReconstructionUpload)) ? PendingRawUploadPollInterval : ReconstructionsPollInterval;
}

export function resolveTrackedRawUploads(tracked: TrackedRawUpload[], annotations: Annotation[]): { finished: FinishedRawUpload[]; remaining: TrackedRawUpload[] } {
    const finished: FinishedRawUpload[] = [];
    const remaining: TrackedRawUpload[] = [];

    for (const entry of tracked) {
        const annotation = annotations.find(a => a.id == entry.annotationId);

        const latest = annotation?.latestRawReconstructionUpload;

        if (!latest) {
            remaining.push(entry);
        } else if (latest.id == entry.id) {
            if (isTerminalRawUploadStatus(latest.status)) {
                finished.push({attempt: latest, neuronLabel: annotation.neuron?.label});
            } else {
                remaining.push(entry);
            }
        } else if (latest.attemptNumber <= entry.attemptNumber) {
            // A poll sent before the upload was answered can return an older attempt; only a newer one supersedes.
            remaining.push(entry);
        }
    }

    return {finished, remaining};
}

function notifyOutcome({attempt, neuronLabel}: FinishedRawUpload) {
    if (attempt.status == RawReconstructionUploadStatus.Accepted) {
        successNotification("Raw Reconstruction Uploaded", `The raw reconstruction for ${neuronLabel} was accepted.`);
    } else if (isFailedRawUploadStatus(attempt.status)) {
        const reason = attempt.failureMessage;

        errorNotification("Raw Reconstruction Upload Failed", `The raw reconstruction for ${neuronLabel} was not accepted${reason ? `: ${reason}` : "."}`);
    }
}

/**
 * Announces the outcome of each raw upload attempt submitted from the page, once the polled annotations show it
 * finished.  Lives on the page rather than the upload panel, which remounts whenever the selection changes.
 */
export function useRawUploadNotifications(annotations?: Annotation[]): (attempt: RawReconstructionUpload) => void {
    const [tracked, setTracked] = useState<TrackedRawUpload[]>([]);

    useEffect(() => {
        if (!annotations || tracked.length == 0) {
            return;
        }

        const {finished, remaining} = resolveTrackedRawUploads(tracked, annotations);

        if (remaining.length == tracked.length) {
            return;
        }

        const resolvedIds = new Set(tracked.filter(t => !remaining.includes(t)).map(t => t.id));

        setTracked(current => current.filter(t => !resolvedIds.has(t.id)));

        finished.forEach(notifyOutcome);
    }, [annotations, tracked]);

    return useCallback((attempt: RawReconstructionUpload) => {
        setTracked(current => current.some(t => t.id == attempt.id) ? current : [...current, {
            id: attempt.id,
            annotationId: attempt.annotationId,
            attemptNumber: attempt.attemptNumber
        }]);
    }, []);
}
