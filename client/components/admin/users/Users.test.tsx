import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../../test/render";
import {makeUser} from "../../../test/fixtures";
import {SettingsHarness} from "../../../test/settingsHarness";
import {Users} from "./Users";
import {USERS_QUERY, UserPermissions} from "../../../graphql/user";
import {AdminSettings, AdminUsersSettings} from "../adminSettings";

describe("Users settings", () => {
    it("keeps the offset when the page size changes", async () => {
        const latest = {current: null as AdminUsersSettings};

        const mocks = [{
            request: {query: USERS_QUERY},
            variableMatcher: () => true,
            maxUsageCount: 5,
            result: {data: {users: {__typename: "UserQueryResponse", totalCount: 100, items: []}}}
        }];

        renderWithProviders(
            <SettingsHarness initial={{...AdminSettings.defaults.users, pagination: {offset: 10, limit: 10}}} latest={latest}>
                {(settings, onSettingsChange) => <Users settings={settings} onSettingsChange={onSettingsChange}/>}
            </SettingsHarness>, {mocks, user: makeUser(UserPermissions.Admin)});

        const slider = await screen.findByRole("slider");

        slider.focus();
        await userEvent.keyboard("{ArrowRight}");

        await waitFor(() => expect(latest.current.pagination).toEqual({offset: 10, limit: 15}));
    });
});
