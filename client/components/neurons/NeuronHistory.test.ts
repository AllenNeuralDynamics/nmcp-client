import {describe, expect, it} from "vitest";

import {formatEventName} from "./NeuronHistory";

describe("formatEventName", () => {
    it.each([
        ["AtlasQualityControlCreate", "Quality Control: Created"],
        ["AtlasQualityControlPassed", "Quality Control: Passed"],
        ["AtlasQualityControlFailed", "Quality Control: Failed"],
        ["QualityControlCreate", "Quality Control: Created"],
        ["QualityControlPassed", "Quality Control: Passed"],
        ["AtlasReconstructionQualityControlRequest", "Atlas-Space Reconstruction: Quality Control Requested"]
    ])("labels %s as %s", (name, label) => {
        expect(formatEventName(name)).toBe(label);
    });
});
