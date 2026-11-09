import {QualityOutput} from "./qualityControl";
import {AtlasQualityControlStatus} from "./atlasQualityControlStatus";

export type AtlasQualityControl = {
    id: string;
    status: AtlasQualityControlStatus;
    current?: QualityOutput;
    history?: QualityOutput[];
}
