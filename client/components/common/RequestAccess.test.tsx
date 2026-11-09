import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {REQUEST_ACCESS_MUTATION} from "../../graphql/accessRequest";
import {RequestAccessResponse} from "../../models/accessRequest";
import {RequestAccessForm} from "./RequestAccess";

const fields: [string, string][] = [
    ["First Name", "Ada"],
    ["Last Name", "Lovelace"],
    ["Institution", "Analytical Engines"],
    ["Email", "ada@example.com"],
    ["Proposed Use", "Tracing neurons."]
];

async function submit(response: RequestAccessResponse) {
    const onResponse = vi.fn();

    renderWithProviders(<RequestAccessForm onResponse={onResponse}/>, {
        mocks: [{
            request: {query: REQUEST_ACCESS_MUTATION},
            variableMatcher: () => true,
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

    it.each([RequestAccessResponse.DuplicateOpen, RequestAccessResponse.Throttled])("keeps the entries after response %i", async response => {
        await submit(response);

        for (const [label, value] of fields) {
            expect(screen.getByRole("textbox", {name: label})).toHaveValue(value);
        }
    });
});
