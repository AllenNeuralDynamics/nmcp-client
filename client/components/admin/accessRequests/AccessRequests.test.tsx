import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../../test/render";
import {makeUser} from "../../../test/fixtures";
import {SettingsHarness} from "../../../test/settingsHarness";
import {AccessRequests, Feedback} from "./AccessRequests";
import {ACCESS_REQUESTS_QUERY, UPDATE_ACCESS_REQUEST_STATUS_MUTATION} from "../../../graphql/accessRequest";
import {AccessRequestKind, AccessRequestStatus} from "../../../models/accessRequest";
import {UserPermissions} from "../../../graphql/user";
import {AdminAccessRequestsSettings, AdminSettings} from "../adminSettings";
import {NotificationContext, Notifications} from "../../app/NotificationsApp";

describe("AccessRequests settings", () => {
    it("keeps the offset when the page size changes", async () => {
        const latest = {current: null as AdminAccessRequestsSettings};

        const mocks = [{
            request: {query: ACCESS_REQUESTS_QUERY},
            variableMatcher: () => true,
            maxUsageCount: 5,
            result: {data: {accessRequests: {__typename: "AccessRequestQueryResponse", totalCount: 100, offset: 10, items: []}}}
        }];

        renderWithProviders(
            <SettingsHarness initial={{...AdminSettings.defaults.accessRequests, pagination: {offset: 10, limit: 10}}} latest={latest}>
                {(settings, onSettingsChange) => <AccessRequests settings={settings} onSettingsChange={onSettingsChange}/>}
            </SettingsHarness>, {mocks, user: makeUser(UserPermissions.Admin)});

        const slider = await screen.findByRole("slider");

        slider.focus();
        await userEvent.keyboard("{ArrowRight}");

        await waitFor(() => expect(latest.current.pagination).toEqual({offset: 10, limit: 15}));
    });
});

const item = (requestKind: AccessRequestKind) => ({
    __typename: "AccessRequest",
    id: "r1",
    firstName: "Ada",
    lastName: "Lovelace",
    emailAddress: "ada@example.com",
    affiliation: "Analytical Engines",
    purpose: "Hello",
    notes: "",
    status: AccessRequestStatus.Unreviewed,
    requestKind,
    admin: null,
    assigned: null,
    createdAt: 0,
    updatedAt: 0
});

function renderQueue(Queue: typeof AccessRequests, requestKind: AccessRequestKind, onUpdate = vi.fn()) {
    const queried: object[] = [];

    const mocks = [{
        request: {query: ACCESS_REQUESTS_QUERY},
        variableMatcher: (variables: { input: object }) => {
            queried.push(variables.input);
            return true;
        },
        maxUsageCount: 5,
        result: {data: {accessRequests: {__typename: "AccessRequestQueryResponse", totalCount: 1, offset: 0, items: [item(requestKind)]}}}
    }, {
        request: {query: UPDATE_ACCESS_REQUEST_STATUS_MUTATION},
        variableMatcher: (variables: object) => {
            onUpdate(variables);
            return true;
        },
        result: {data: {updateAccessRequestStatus: {...item(requestKind), status: AccessRequestStatus.Accepted}}}
    }];

    renderWithProviders(
        <SettingsHarness initial={AdminSettings.defaults.accessRequests} latest={{current: null}}>
            {(settings, onSettingsChange) => <Queue settings={settings} onSettingsChange={onSettingsChange}/>}
        </SettingsHarness>, {mocks, user: makeUser(UserPermissions.Admin)});

    return queried;
}

describe("AccessRequests kinds", () => {
    it("queries only access requests and offers accept and deny", async () => {
        const queried = renderQueue(AccessRequests, AccessRequestKind.Access);

        await screen.findByText("Hello");

        expect(queried.every(input => (input as { requestKind: number }).requestKind === AccessRequestKind.Access)).toBe(true);
        expect(screen.getByRole("button", {name: "Accept"})).toBeTruthy();
        expect(screen.getByRole("button", {name: "Deny"})).toBeTruthy();
    });

    it("queries only feedback and marks a message responded with the accepted status", async () => {
        const onUpdate = vi.fn();

        const queried = renderQueue(Feedback, AccessRequestKind.Feedback, onUpdate);

        await userEvent.click(await screen.findByText("Hello"));

        expect(queried.every(input => (input as { requestKind: number }).requestKind === AccessRequestKind.Feedback)).toBe(true);
        expect(screen.queryByRole("button", {name: "Accept"})).toBeNull();
        expect(screen.queryByRole("button", {name: "Deny"})).toBeNull();

        await userEvent.click(screen.getByRole("button", {name: "Mark as Responded"}));

        await waitFor(() => expect(onUpdate).toHaveBeenCalledWith({id: "r1", status: AccessRequestStatus.Accepted}));
    });
});

describe("AccessRequests refresh", () => {
    it.each([
        ["access requests", AccessRequests, AccessRequestKind.Access, "openAccessRequestCount", "openFeedbackCount"],
        ["feedback", Feedback, AccessRequestKind.Feedback, "openFeedbackCount", "openAccessRequestCount"]
    ] as const)("refetches %s when their own open count changes, and only then", async (_, Queue, requestKind, own, other) => {
        let fetches = 0;

        const mocks = [{
            request: {query: ACCESS_REQUESTS_QUERY},
            variableMatcher: () => true,
            maxUsageCount: 10,
            result: () => {
                fetches++;
                return {data: {accessRequests: {__typename: "AccessRequestQueryResponse", totalCount: 1, offset: 0, items: [item(requestKind)]}}};
            }
        }];

        const queue = (notifications: Notifications) => (
            <NotificationContext.Provider value={notifications}>
                <SettingsHarness initial={AdminSettings.defaults.accessRequests} latest={{current: null}}>
                    {(settings, onSettingsChange) => <Queue settings={settings} onSettingsChange={onSettingsChange}/>}
                </SettingsHarness>
            </NotificationContext.Provider>
        );

        const counts: Notifications = {issueCount: 0, openFeedbackCount: 1, openAccessRequestCount: 1};

        const {rerender} = renderWithProviders(queue(counts), {mocks, user: makeUser(UserPermissions.Admin)});

        await screen.findByText("Hello");
        expect(fetches).toBe(1);

        rerender(queue({...counts, issueCount: 5, [other]: 7}));
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(fetches).toBe(1);

        rerender(queue({...counts, [own]: 2}));
        await waitFor(() => expect(fetches).toBe(2));
    });
});
