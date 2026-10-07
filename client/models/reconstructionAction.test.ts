import {describe, expect, it} from "vitest";

import {actionColor, actionName, actionTooltip, ReconstructionAction} from "./reconstructionAction";

const members = Object.values(ReconstructionAction).filter((v): v is ReconstructionAction => typeof v === "number");

describe("mappers", () => {
    it.each(members)("names, describes and colours %s", action => {
        expect(actionName(action)).not.toBe("UNKNOWN");
        expect(actionTooltip(action)).not.toBe("UNKNOWN");
        expect(actionColor(action)).not.toBe("black");
    });
});

describe("hold actions added for the API", () => {
    it.each([ReconstructionAction.MarkIncomplete, ReconstructionAction.MarkDuplicate])("%s is coloured as MarkUntraceable", action => {
        expect(actionColor(action)).toBe(actionColor(ReconstructionAction.MarkUntraceable));
    });

    it("names each by the status it sets", () => {
        expect(actionName(ReconstructionAction.MarkIncomplete)).toBe("Incomplete");
        expect(actionName(ReconstructionAction.MarkDuplicate)).toBe("Duplicate");
    });
});
