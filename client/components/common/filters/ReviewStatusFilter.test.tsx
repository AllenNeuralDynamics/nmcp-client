import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../../test/render";
import {ReviewStatusFilter} from "./ReviewStatusFilter";
import {OptionalFilter} from "../../../viewmodel/candidateFilter";
import {availableReviewEntries, ReviewStatusEntries} from "../../review/reviewAccess";

const label = (value: string) => ReviewStatusEntries.find(e => e.value == value).label;

describe("ReviewStatusFilter", () => {
    it("offers PeerReview to a dual-role reviewer and stores it with a publish stage", async () => {
        const filter = new OptionalFilter<string[]>([], true);

        renderWithProviders(<ReviewStatusFilter filter={filter} available={availableReviewEntries({peer: true, publish: true}, false)}/>);

        await userEvent.click(screen.getByRole("textbox"));
        await userEvent.click(await screen.findByRole("option", {name: label("peer-review")}));
        await userEvent.click(await screen.findByRole("option", {name: label("publish-review")}));

        expect(filter.contents).toEqual(["peer-review", "publish-review"]);
    });

    it("shows no pill for a stored selection that Approval Only hides", () => {
        const filter = new OptionalFilter<string[]>(["automatic-failed", "publish-review"], true);

        const {container} = renderWithProviders(<ReviewStatusFilter filter={filter} available={availableReviewEntries({peer: false, publish: true}, true)}/>);

        const pills = [...container.querySelectorAll(".mantine-MultiSelect-pill")].map(p => p.textContent);

        expect(pills).toEqual([label("publish-review")]);
    });
});
