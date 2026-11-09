import {describe, expect, it} from "vitest";

import {atlasQualityControlColor, atlasQualityControlStatus, AtlasQualityControlStatus} from "./atlasQualityControlStatus";

const members = Object.values(AtlasQualityControlStatus).filter((v): v is AtlasQualityControlStatus => typeof v === "number");

describe("mappers", () => {
    it.each(members)("names and colours %s", status => {
        expect(atlasQualityControlStatus(status)).not.toBe("Unknown");
        expect(atlasQualityControlColor(status)).not.toBeNull();
    });

    it("covers InProgress", () => {
        expect(members).toContain(AtlasQualityControlStatus.InProgress);
    });
});
