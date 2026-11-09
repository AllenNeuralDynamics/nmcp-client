import {User} from "./user";

// Mirrors ../nmcp-api/src/models/rawReconstructionUploadStatus.ts.
export enum RawReconstructionUploadStatus {
    // No longer written by the API; kept for attempts that already carry it.
    Uploading = 100,
    PendingQualityControl = 200,
    FailedUpload = 300,
    FailedPrecomputed = 320,
    FailedQualityControl = 400,
    ErroredQualityControl = 410,
    FailedQualityControlService = 420,
    Accepted = 500
}

// Mirrors TerminalRawUploadStatuses in ../nmcp-api/src/models/rawReconstructionUploadStatus.ts.
export const TerminalRawUploadStatuses: RawReconstructionUploadStatus[] = [
    RawReconstructionUploadStatus.FailedUpload,
    RawReconstructionUploadStatus.FailedPrecomputed,
    RawReconstructionUploadStatus.FailedQualityControl,
    RawReconstructionUploadStatus.ErroredQualityControl,
    RawReconstructionUploadStatus.FailedQualityControlService,
    RawReconstructionUploadStatus.Accepted
];

// Mirror the constants of the same names in ../nmcp-api/src/models/rawReconstructionUpload.ts.
export const RawUploadInProgressCode = 1011;

export const RawUploadServiceIssueCode = 1012;

// Mirrors RawReconstructionUploadFormat in ../nmcp-api/src/models/rawReconstructionUpload.ts.
export enum RawReconstructionUploadFormat {
    Swc = 100,
    Parquet = 200
}

// Date-typed fields arrive as epoch milliseconds.
export type RawReconstructionUpload = {
    id: string;
    annotationId?: string;
    attemptNumber: number;
    status: RawReconstructionUploadStatus;
    user?: User;
    sourceFilename: string;
    format?: RawReconstructionUploadFormat;
    failureMessage: string;
    qcTag?: string;
    qualityControlUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export function isTerminalRawUploadStatus(status: RawReconstructionUploadStatus): boolean {
    return TerminalRawUploadStatuses.includes(status);
}

export function isFailedRawUploadStatus(status: RawReconstructionUploadStatus): boolean {
    return isTerminalRawUploadStatus(status) && status != RawReconstructionUploadStatus.Accepted;
}

// Uploading is not pending: no attempt at it will ever finish, and the API's in-progress gate ignores it.
export function isRawUploadPending(attempt?: RawReconstructionUpload): boolean {
    return attempt?.status == RawReconstructionUploadStatus.PendingQualityControl;
}

export function rawUploadStatusName(status: RawReconstructionUploadStatus): string {
    switch (status) {
        case RawReconstructionUploadStatus.Uploading:
            return "Uploading";
        case RawReconstructionUploadStatus.PendingQualityControl:
            return "Pending QC";
        case RawReconstructionUploadStatus.FailedUpload:
            return "Failed Upload";
        case RawReconstructionUploadStatus.FailedPrecomputed:
            return "Failed Precomputed Generation";
        case RawReconstructionUploadStatus.FailedQualityControl:
            return "Failed QC";
        case RawReconstructionUploadStatus.ErroredQualityControl:
            return "QC Error";
        case RawReconstructionUploadStatus.FailedQualityControlService:
            return "QC Service Failure";
        case RawReconstructionUploadStatus.Accepted:
            return "Accepted";
        default:
            return "Unknown";
    }
}

export function rawUploadStatusColor(status: RawReconstructionUploadStatus): string {
    switch (status) {
        case RawReconstructionUploadStatus.Uploading:
        case RawReconstructionUploadStatus.PendingQualityControl:
            return "blue";
        case RawReconstructionUploadStatus.FailedUpload:
        case RawReconstructionUploadStatus.FailedPrecomputed:
        case RawReconstructionUploadStatus.FailedQualityControl:
        case RawReconstructionUploadStatus.ErroredQualityControl:
        case RawReconstructionUploadStatus.FailedQualityControlService:
            return "red";
        case RawReconstructionUploadStatus.Accepted:
            return "green";
        default:
            return "gray";
    }
}
