import * as React from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeUser} from "../../test/fixtures";
import {UserPermissions} from "../../graphql/user";
import {REQUEST_ACCESS_MUTATION} from "../../graphql/accessRequest";
import {AccessRequestKind, RequestAccessResponse} from "../../models/accessRequest";
import {contactPortalResponseMessage, ContactPortalForm, RequestAccessForm, requestAccessResponseMessage} from "./RequestAccess";

const authentication = vi.hoisted(() => ({isAuthenticated: false}));

vi.mock("@azure/msal-react", () => ({useIsAuthenticated: () => authentication.isAuthenticated}));

const fields: [string, string][] = [
    ["First Name", "Ada"],
    ["Last Name", "Lovelace"],
    ["Institution", "Analytical Engines"],
    ["Email", "ada@example.com"],
    ["Proposed Use", "Tracing neurons."]
];

async function submit(response: RequestAccessResponse, onSubmit = vi.fn()) {
    const onResponse = vi.fn();

    renderWithProviders(<RequestAccessForm onResponse={onResponse}/>, {
        mocks: [{
            request: {query: REQUEST_ACCESS_MUTATION},
            variableMatcher: (variables: object) => {
                onSubmit(variables);
                return true;
            },
            result: {data: {requestAccess: response}}
        }]
    });

    for (const [label, value] of fields) {
        await userEvent.type(screen.getByRole("textbox", {name: label}), value);
    }

    await userEvent.click(screen.getByRole("button", {name: "Request"}));

    await waitFor(() => expect(onResponse).toHaveBeenCalledWith(response));
}

describe("RequestAccessForm", () => {
    it("clears the form after an accepted request", async () => {
        await submit(RequestAccessResponse.Accepted);

        for (const [label] of fields) {
            expect(screen.getByRole("textbox", {name: label})).toHaveValue("");
        }
        expect(screen.getByRole("button", {name: "Request"})).toBeDisabled();
    });

    it("submits as an access request", async () => {
        const onSubmit = vi.fn();

        await submit(RequestAccessResponse.Accepted, onSubmit);

        expect(onSubmit.mock.calls[0][0].request.requestKind).toBe(AccessRequestKind.Access);
    });

    it.each([RequestAccessResponse.DuplicateOpen, RequestAccessResponse.Throttled])("keeps the entries after response %i", async response => {
        await submit(response);

        for (const [label, value] of fields) {
            expect(screen.getByRole("textbox", {name: label})).toHaveValue(value);
        }
    });
});

describe("ContactPortalForm", () => {
    it("explains the open message limit", () => {
        expect(contactPortalResponseMessage(RequestAccessResponse.TooManyOpenFeedback)).toMatch(/limit on messages awaiting a response/);
    });

    it("submits as feedback", async () => {
        const onSubmit = vi.fn();
        const onResponse = vi.fn();

        renderWithProviders(<ContactPortalForm wide onResponse={onResponse}/>, {
            mocks: [{
                request: {query: REQUEST_ACCESS_MUTATION},
                variableMatcher: (variables: object) => {
                    onSubmit(JSON.parse(JSON.stringify(variables)));
                    return true;
                },
                result: {data: {requestAccess: RequestAccessResponse.Accepted}}
            }]
        });

        for (const [label, value] of [...fields.slice(0, 4), ["Message", "A question."]]) {
            await userEvent.type(screen.getByRole("textbox", {name: label}), value);
        }

        await userEvent.click(screen.getByRole("button", {name: "Send Message"}));

        await waitFor(() => expect(onResponse).toHaveBeenCalledWith(RequestAccessResponse.Accepted));

        expect(onSubmit.mock.calls[0][0].request).toMatchObject({purpose: "A question.", requestKind: AccessRequestKind.Feedback});
    });
});

describe("submission handling", () => {
    afterEach(() => {
        authentication.isAuthenticated = false;
    });

    async function fill() {
        for (const [label, value] of [...fields.slice(0, 4), ["Message", "A question."]]) {
            await userEvent.type(screen.getByRole("textbox", {name: label}), value);
        }
    }

    it.each([
        ["an error", {error: new Error("network down")}],
        ["an invalid response", {result: {data: {requestAccess: RequestAccessResponse.Invalid}}}]
    ])("reports %s as not sent and keeps the entries", async (_, outcome) => {
        const onResponse = vi.fn();

        renderWithProviders(<ContactPortalForm onResponse={onResponse}/>, {
            mocks: [{request: {query: REQUEST_ACCESS_MUTATION}, variableMatcher: () => true, ...outcome}]
        });

        await fill();
        await userEvent.click(screen.getByRole("button", {name: "Send Message"}));

        await waitFor(() => expect(onResponse).toHaveBeenCalledWith(RequestAccessResponse.Invalid));
        expect(screen.getByRole("textbox", {name: "Message"})).toHaveValue("A question.");
    });

    it("says an invalid or failed submission was not sent", () => {
        expect(contactPortalResponseMessage(RequestAccessResponse.Invalid)).toMatch(/problem sending/);
        expect(requestAccessResponseMessage(RequestAccessResponse.Invalid)).toMatch(/problem sending/);
    });

    it("sends once however quickly the button is clicked again", async () => {
        const onSubmit = vi.fn();
        const onResponse = vi.fn();

        renderWithProviders(<ContactPortalForm onResponse={onResponse}/>, {
            mocks: [{
                request: {query: REQUEST_ACCESS_MUTATION},
                variableMatcher: () => {
                    onSubmit();
                    return true;
                },
                delay: 50,
                maxUsageCount: 2,
                result: {data: {requestAccess: RequestAccessResponse.Accepted}}
            }]
        });

        await fill();

        const button = screen.getByRole("button", {name: "Send Message"});

        await userEvent.click(button);
        await userEvent.click(button);

        await waitFor(() => expect(onResponse).toHaveBeenCalledWith(RequestAccessResponse.Accepted));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onResponse).toHaveBeenCalledTimes(1);
    });

    it.each([["contact", ContactPortalForm], ["access", RequestAccessForm]])("does not prefill the %s form with the anonymous placeholder user when signed out", (_, Form) => {
        authentication.isAuthenticated = false;

        renderWithProviders(<Form onResponse={vi.fn()}/>, {user: {...makeUser(UserPermissions.None), firstName: "System", lastName: "NoUser"}});

        for (const label of ["First Name", "Last Name", "Institution", "Email"]) {
            expect(screen.getByRole("textbox", {name: label})).toHaveValue("");
        }
    });

    it("prefills a signed-in user's details and keeps them after sending", async () => {
        authentication.isAuthenticated = true;

        const onResponse = vi.fn();

        renderWithProviders(<ContactPortalForm onResponse={onResponse}/>, {
            user: {...makeUser(UserPermissions.None), affiliation: "Allen Institute"},
            mocks: [{
                request: {query: REQUEST_ACCESS_MUTATION},
                variableMatcher: () => true,
                result: {data: {requestAccess: RequestAccessResponse.Accepted}}
            }]
        });

        expect(screen.getByRole("textbox", {name: "First Name"})).toHaveValue("Test");
        expect(screen.getByRole("textbox", {name: "Last Name"})).toHaveValue("User");
        expect(screen.getByRole("textbox", {name: "Institution"})).toHaveValue("Allen Institute");
        expect(screen.getByRole("textbox", {name: "Email"})).toHaveValue("user-1@example.com");

        await userEvent.type(screen.getByRole("textbox", {name: "Message"}), "A question.");
        await userEvent.click(screen.getByRole("button", {name: "Send Message"}));

        await waitFor(() => expect(onResponse).toHaveBeenCalledWith(RequestAccessResponse.Accepted));
        expect(screen.getByRole("textbox", {name: "Message"})).toHaveValue("");
        expect(screen.getByRole("textbox", {name: "Email"})).toHaveValue("user-1@example.com");
    });
});
