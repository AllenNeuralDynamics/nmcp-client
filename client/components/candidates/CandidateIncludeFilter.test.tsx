import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {CandidateIncludeFilter} from "./CandidateIncludeFilter";
import {CandidateFilter} from "../../viewmodel/candidateFilter";
import {AnnotationStatus} from "../../models/annotationStatus";

describe("CandidateIncludeFilter", () => {
    it("offers In Progress, Duplicate, Incomplete and Untraceable in that order", async () => {
        renderWithProviders(<CandidateIncludeFilter candidateFilter={new CandidateFilter()}/>);

        await userEvent.click(screen.getByRole("textbox"));

        const names = (await screen.findAllByRole("option")).map(o => o.textContent);

        expect(names).toEqual(["In Progress", "Duplicate", "Incomplete", "Untraceable"]);
    });

    it("stores selections as status numbers", async () => {
        const filter = new CandidateFilter();
        filter.setAuthenticated(true);

        renderWithProviders(<CandidateIncludeFilter candidateFilter={filter}/>);

        await userEvent.click(screen.getByRole("textbox"));
        await userEvent.click(await screen.findByRole("option", {name: "Duplicate"}));
        await userEvent.click(await screen.findByRole("option", {name: "In Progress"}));

        expect(filter.includedStatuses).toEqual([AnnotationStatus.Duplicate, AnnotationStatus.InProgress]);
        expect(filter.includeInProgress).toBe(true);
        expect(filter.excludedAnnotationStatuses).toEqual([AnnotationStatus.Incomplete, AnnotationStatus.Untraceable]);
    });

    it("shows a pill for each stored selection", () => {
        const filter = new CandidateFilter();
        filter.includedStatuses = [AnnotationStatus.Untraceable];

        const {container} = renderWithProviders(<CandidateIncludeFilter candidateFilter={filter}/>);

        const pills = [...container.querySelectorAll(".mantine-MultiSelect-pill")].map(p => p.textContent);

        expect(pills).toEqual(["Untraceable"]);
    });

    it("shows the None placeholder only while nothing is selected", async () => {
        const filter = new CandidateFilter();

        renderWithProviders(<CandidateIncludeFilter candidateFilter={filter}/>);

        expect(screen.getByRole("textbox").getAttribute("placeholder")).toBe("None");

        await userEvent.click(screen.getByRole("textbox"));
        await userEvent.click(await screen.findByRole("option", {name: "Duplicate"}));

        expect(screen.getByRole("textbox").getAttribute("placeholder")).toBeNull();
    });
});
