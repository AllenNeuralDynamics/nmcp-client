import * as React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";

import {renderWithProviders} from "../../test/render";
import {makeUser} from "../../test/fixtures";
import {UserPermissions} from "../../graphql/user";
import {authorizationLabels, Support} from "./Support";

const authentication = vi.hoisted(() => ({isAuthenticated: false}));

vi.mock("@azure/msal-react", () => ({useIsAuthenticated: () => authentication.isAuthenticated}));

describe("authorizationLabels", () => {
    it.each([
        [UserPermissions.None, []],
        [UserPermissions.AnnotateOne, ["Annotation"]],
        [UserPermissions.AnnotateAll | UserPermissions.PeerReview, ["Annotation", "Peer Review"]],
        [UserPermissions.TeamReview | UserPermissions.PublishReview, ["Team Review", "Publish Review"]],
        [UserPermissions.Edit, ["Manage Specimens and Neurons"]],
        [UserPermissions.Admin, ["Annotation", "Peer Review", "Team Review", "Publish Review", "Manage Specimens and Neurons", "Administration"]]
    ])("lists permissions %i as %j", (permissions, labels) => {
        expect(authorizationLabels(permissions)).toEqual(labels);
    });
});

describe("Support", () => {
    beforeEach(() => {
        authentication.isAuthenticated = false;
    });

    it("shows the documentation section", () => {
        renderWithProviders(<Support/>);

        expect(screen.queryByText("Documentation and Access")).toBeNull();
        expect(screen.getByText("Documentation")).toBeTruthy();
        expect(screen.getByRole("link", {name: "Neuron Morphology Community Portal Getting Started Guide."})).toHaveAttribute("href", "https://dx.doi.org/10.17504/protocols.io.1wgb1dkqyvpk/v1");
    });

    it("embeds the access request form when signed out", () => {
        renderWithProviders(<Support/>);

        expect(screen.getByText("Request Access")).toBeTruthy();
        expect(screen.getByRole("textbox", {name: "Proposed Use"})).toBeTruthy();
        expect(screen.getByRole("button", {name: "Request"})).toBeDisabled();
        expect(screen.queryByText("You are authorized for")).toBeNull();
    });

    it.each([false, true])("offers the contact form when signed in is %s", isAuthenticated => {
        authentication.isAuthenticated = isAuthenticated;

        renderWithProviders(<Support/>, {user: makeUser(UserPermissions.None)});

        expect(screen.getByText("Contact Portal Team")).toBeTruthy();
        expect(screen.getByRole("textbox", {name: "Message"})).toBeTruthy();
        expect(screen.getByRole("button", {name: "Send Message"})).toBeDisabled();
    });

    it("lists what a signed-in user is authorized for", () => {
        authentication.isAuthenticated = true;

        renderWithProviders(<Support/>, {user: makeUser(UserPermissions.AnnotateAll | UserPermissions.PublishReview)});

        expect(screen.queryByText("Request Access")).toBeNull();
        expect(screen.getByText("You are authorized for")).toBeTruthy();
        expect(screen.getAllByRole("listitem").map(item => item.textContent)).toEqual(["Annotation", "Publish Review"]);
    });

    it("says when a signed-in user holds no permissions", () => {
        authentication.isAuthenticated = true;

        renderWithProviders(<Support/>, {user: makeUser(UserPermissions.None)});

        expect(screen.getByText("You are not yet authorized for any portal activities.")).toBeTruthy();
    });
});
