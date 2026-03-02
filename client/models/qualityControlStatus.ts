export enum QualityControlStatus {
    NotReady = 0,
    Pending = 100,
    Error = 300,
    Failed = 400,
    Passed = 500
}

export function qualityControlStatus(status: QualityControlStatus): string {
    switch (status) {
        case QualityControlStatus.NotReady:
            return "Not Ready";
        case QualityControlStatus.Pending:
            return "Pending"
        case QualityControlStatus.Error:
            return "Tool or Service Error";
        case QualityControlStatus.Failed:
            return "Failed";
        case QualityControlStatus.Passed:
            return "Passed";
        default:
            return "Unknown";
    }
}

export function qualityControlColor(status: QualityControlStatus): string {
    switch (status) {
        case QualityControlStatus.NotReady:
            return "cyan";
        case QualityControlStatus.Pending:
            return "indigo";
        case QualityControlStatus.Error:
            return "red";
        case QualityControlStatus.Failed:
            return "red";
        case QualityControlStatus.Passed:
            return "green";
        default:
            return null;
    }
}
