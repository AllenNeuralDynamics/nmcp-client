import * as React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeUser} from "../../test/fixtures";
import {Admin} from "./Admin";
import {UserPermissions} from "../../graphql/user";
import {PageSettingsKeys} from "../../util/pageSettings";
import {AdminSettings} from "./adminSettings";

// vi.mock factories are hoisted above the file's own declarations, so the stub factory is hoisted with them.
const {stub} = vi.hoisted(() => ({
    stub: (name: string) => ({settings}: { settings?: object }) => React.createElement("div", {"data-testid": name}, JSON.stringify(settings ?? null))
}));

vi.mock("./users/Users", () => ({Users: stub("users")}));
vi.mock("./system/Collections", () => ({Collections: stub("collections")}));
vi.mock("./published/Published", () => ({Published: stub("published")}));
vi.mock("./issues/Issues", () => ({Issues: stub("issues")}));
vi.mock("./accessRequests/AccessRequests", () => ({AccessRequests: stub("accessrequests")}));
vi.mock("./apiKeys/ApiKeys", () => ({ApiKeys: stub("apikeys")}));

function renderAdmin(entry: object) {
    localStorage.setItem(PageSettingsKeys.admin, JSON.stringify({...AdminSettings.defaults, ...entry}));

    renderWithProviders(<Admin/>, {user: makeUser(UserPermissions.Admin)});
}

const stored = () => JSON.parse(localStorage.getItem(PageSettingsKeys.admin));

describe("Admin settings", () => {
    beforeEach(() => localStorage.clear());

    it("restores the stored tab", () => {
        renderAdmin({tab: "issues"});

        expect(screen.getByRole("tab", {name: /Issues/})).toHaveAttribute("aria-selected", "true");
    });

    it("falls back to Users for an unknown tab", () => {
        renderAdmin({tab: "nope"});

        expect(screen.getByRole("tab", {name: /Users/})).toHaveAttribute("aria-selected", "true");
    });

    it("stores the selected tab", async () => {
        renderAdmin({});

        await userEvent.click(screen.getByRole("tab", {name: /Publishing/}));

        expect(stored().tab).toBe("published");
    });

    it("gives each tab its own section", () => {
        const users = {filters: {includeImported: true}, pagination: {offset: 20, limit: 25}};

        renderAdmin({users});

        expect(JSON.parse(screen.getByTestId("users").textContent)).toEqual(users);
    });
});
