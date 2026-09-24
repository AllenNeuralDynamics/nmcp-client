import {describe, expect, it} from "vitest";

import {qualityControlColor, qualityControlStatus, QualityControlStatus} from "./qualityControlStatus";

const members = Object.values(QualityControlStatus).filter((v): v is QualityControlStatus => typeof v === "number");

describe("mappers", () => {
    it.each(members)("names and colours %s", status => {
        expect(qualityControlStatus(status)).not.toBe("Unknown");
        expect(qualityControlColor(status)).not.toBeNull();
    });

    it("covers InProgress", () => {
        expect(members).toContain(QualityControlStatus.InProgress);
    });
});
