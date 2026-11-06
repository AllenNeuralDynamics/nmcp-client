import {User} from "./user";

// Mirrors ../nmcp-api/src/models/rawReconstructionUploadStatus.ts.
export enum RawReconstructionUploadStatus {
    Uploading = 100,
    PendingQualityControl = 200,
    FailedUpload = 300,
    FailedQualityControl = 400,
    Accepted = 500
}

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
    createdAt?: Date;
    updatedAt?: Date;
}

export function rawUploadStatusName(status: RawReconstructionUploadStatus): string {
    switch (status) {
        case RawReconstructionUploadStatus.Uploading:
            return "Uploading";
        case RawReconstructionUploadStatus.PendingQualityControl:
            return "Pending QC";
        case RawReconstructionUploadStatus.FailedUpload:
            return "Failed Upload";
        case RawReconstructionUploadStatus.FailedQualityControl:
            return "Failed QC";
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
        case RawReconstructionUploadStatus.FailedQualityControl:
            return "red";
        case RawReconstructionUploadStatus.Accepted:
            return "green";
        default:
            return "gray";
    }
}
