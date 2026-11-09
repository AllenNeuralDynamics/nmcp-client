export enum AtlasQualityControlStatus {
    NotReady = 0,
    Pending = 100,
    InProgress = 200,
    Error = 300,
    Failed = 400,
    Passed = 500
}

export function atlasQualityControlStatus(status: AtlasQualityControlStatus): string {
    switch (status) {
        case AtlasQualityControlStatus.NotReady:
            return "Not Ready";
        case AtlasQualityControlStatus.Pending:
            return "Pending"
        case AtlasQualityControlStatus.InProgress:
            return "In Progress";
        case AtlasQualityControlStatus.Error:
            return "Tool or Service Error";
        case AtlasQualityControlStatus.Failed:
            return "Failed";
        case AtlasQualityControlStatus.Passed:
            return "Passed";
        default:
            return "Unknown";
    }
}

export function atlasQualityControlColor(status: AtlasQualityControlStatus): string {
    switch (status) {
        case AtlasQualityControlStatus.NotReady:
            return "cyan";
        case AtlasQualityControlStatus.Pending:
            return "indigo";
        case AtlasQualityControlStatus.InProgress:
            return "blue";
        case AtlasQualityControlStatus.Error:
            return "red";
        case AtlasQualityControlStatus.Failed:
            return "red";
        case AtlasQualityControlStatus.Passed:
            return "green";
        default:
            return null;
    }
}
