import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";

import {renderWithProviders} from "../../test/render";
import {makeUser} from "../../test/fixtures";
import {UserPermissions} from "../../graphql/user";
import {NotificationContext, Notifications} from "./NotificationsApp";
import {PageHeader} from "./PageHeader";
import {DataConstants} from "../../models/constants";

vi.mock("@azure/msal-react", () => ({useIsAuthenticated: () => true}));
vi.mock("./SignInSignOutButton", () => ({SignInSignOutButton: () => null}));

function adminLinkText(notifications: Notifications): string {
    renderWithProviders(
        <NotificationContext.Provider value={notifications}>
            <PageHeader/>
        </NotificationContext.Provider>, {user: makeUser(UserPermissions.Admin), constants: new DataConstants()});

    return screen.getByRole("link", {name: /Admin/}).textContent;
}

describe("PageHeader admin marks", () => {
    it.each([
        [{issueCount: 0, openFeedbackCount: 0, openAccessRequestCount: 0}, "Admin"],
        [{issueCount: 2, openFeedbackCount: 0, openAccessRequestCount: 0}, "!Admin"],
        [{issueCount: 0, openFeedbackCount: 1, openAccessRequestCount: 0}, "!Admin"],
        [{issueCount: 0, openFeedbackCount: 0, openAccessRequestCount: 1}, "!Admin"],
        [{issueCount: 1, openFeedbackCount: 1, openAccessRequestCount: 1}, "!Admin"]
    ])("marks %j as %s", (notifications, expected) => {
        expect(adminLinkText(notifications)).toBe(expected);
    });
});
