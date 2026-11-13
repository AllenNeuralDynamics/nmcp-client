import * as React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {useLocation} from "react-router-dom";

import {renderWithProviders} from "../../test/render";
import {makeUser} from "../../test/fixtures";
import {Admin} from "./Admin";
import {UserPermissions} from "../../graphql/user";
import {PageSettingsKeys} from "../../util/pageSettings";
import {AdminSettings} from "./adminSettings";
import {NotificationContext} from "../app/NotificationsApp";

// vi.mock factories are hoisted above the file's own declarations, so the stub factory is hoisted with them.
const {stub} = vi.hoisted(() => ({
    stub: (name: string) => ({settings}: { settings?: object }) => React.createElement("div", {"data-testid": name}, JSON.stringify(settings ?? null))
}));

vi.mock("./users/Users", () => ({Users: stub("users")}));
vi.mock("./system/Collections", () => ({Collections: stub("collections")}));
vi.mock("./published/Published", () => ({Published: stub("published")}));
vi.mock("./issues/Issues", () => ({Issues: stub("issues")}));
vi.mock("./accessRequests/AccessRequests", () => ({AccessRequests: stub("accessrequests"), Feedback: stub("feedback")}));
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

    it.each([[0, ""], [3, "3"]])("badges the Feedback tab with %i open messages", (openFeedbackCount, label) => {
        localStorage.setItem(PageSettingsKeys.admin, JSON.stringify(AdminSettings.defaults));

        renderWithProviders(
            <NotificationContext.Provider value={{issueCount: 0, openFeedbackCount, openAccessRequestCount: 0}}>
                <Admin/>
            </NotificationContext.Provider>, {user: makeUser(UserPermissions.Admin)});

        expect(screen.getByRole("tab", {name: /Feedback & Messages/}).textContent).toBe(`Feedback & Messages${label}`);
    });

    it.each([[0, ""], [4, "4"]])("badges the Access Requests tab with %i open requests", (openAccessRequestCount, label) => {
        localStorage.setItem(PageSettingsKeys.admin, JSON.stringify(AdminSettings.defaults));

        renderWithProviders(
            <NotificationContext.Provider value={{issueCount: 0, openFeedbackCount: 0, openAccessRequestCount}}>
                <Admin/>
            </NotificationContext.Provider>, {user: makeUser(UserPermissions.Admin)});

        expect(screen.getByRole("tab", {name: /Access Requests/}).textContent).toBe(`Access Requests${label}`);
    });

    describe("tab links", () => {
        const LocationProbe = () => <div data-testid="search">{useLocation().search}</div>;

        function renderLinked(route: string, tab = "users") {
            localStorage.setItem(PageSettingsKeys.admin, JSON.stringify({...AdminSettings.defaults, tab}));

            renderWithProviders(<><Admin/><LocationProbe/></>, {user: makeUser(UserPermissions.Admin), route});
        }

        it.each(["feedback", "accessrequests", "issues"])("opens the %s tab, stores it and drops it from the URL", async tab => {
            renderLinked(`/admin?tab=${tab}`);

            expect(screen.getByRole("tab", {selected: true})).toHaveAttribute("id", expect.stringContaining(tab));
            await waitFor(() => expect(stored().tab).toBe(tab));
            expect(screen.getByTestId("search").textContent).toBe("");
        });

        it("ignores an unknown tab and keeps the stored one", () => {
            renderLinked("/admin?tab=nope", "published");

            expect(screen.getByRole("tab", {name: /Publishing/})).toHaveAttribute("aria-selected", "true");
        });
    });
});
