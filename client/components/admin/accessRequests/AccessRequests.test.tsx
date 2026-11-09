import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../../test/render";
import {makeUser} from "../../../test/fixtures";
import {SettingsHarness} from "../../../test/settingsHarness";
import {AccessRequests} from "./AccessRequests";
import {ACCESS_REQUESTS_QUERY} from "../../../graphql/accessRequest";
import {UserPermissions} from "../../../graphql/user";
import {AdminAccessRequestsSettings, AdminSettings} from "../adminSettings";

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
