import {describe, expect, it} from "vitest";

import {hasPermission} from "./user";
import {UserPermissions} from "../graphql/user";

describe("hasPermission", () => {
    it("is true for a holder of the bit", () => {
        expect(hasPermission(UserPermissions.Edit, UserPermissions.Edit)).toBe(true);
    });

    it("is false for a non-holder", () => {
        expect(hasPermission(UserPermissions.PeerReview, UserPermissions.Edit)).toBe(false);
        expect(hasPermission(UserPermissions.None, UserPermissions.Edit)).toBe(false);
    });

    it.each([UserPermissions.AnnotateAll, UserPermissions.Edit, UserPermissions.PeerReview, UserPermissions.PublishReview])("is true for an Admin-only account asked about %s", bits => {
        expect(hasPermission(UserPermissions.Admin, bits)).toBe(true);
    });

    it("matches a composite on any one bit", () => {
        expect(hasPermission(UserPermissions.PeerReview, UserPermissions.ReviewAll)).toBe(true);
        expect(hasPermission(UserPermissions.PublishReview, UserPermissions.ReviewAll)).toBe(true);
        expect(hasPermission(UserPermissions.Edit, UserPermissions.ReviewAll)).toBe(false);
    });

    it("is false for a missing user", () => {
        expect(hasPermission(undefined, UserPermissions.Edit)).toBe(false);
    });
});
