import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {actionIcon, ReconstructionActionButton} from "./ReconstructionAction";
import {actionName, actionTooltip, ReconstructionAction} from "../../models/reconstructionAction";

describe("ReconstructionActionButton", () => {
    describe("enabled", () => {
        it("renders the action name", () => {
            renderWithProviders(<ReconstructionActionButton action={ReconstructionAction.Hold}/>);

            expect(screen.getByRole("button", {name: actionName(ReconstructionAction.Hold)})).toBeInTheDocument();
        });

        it("calls onClick when clicked", async () => {
            const onClick = vi.fn();

            renderWithProviders(<ReconstructionActionButton action={ReconstructionAction.Hold} onClick={onClick}/>);

            await userEvent.click(screen.getByRole("button"));

            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it("shows the action tooltip on hover", async () => {
            renderWithProviders(<ReconstructionActionButton action={ReconstructionAction.Hold}/>);

            await userEvent.hover(screen.getByRole("button"));

            expect(await screen.findByText(actionTooltip(ReconstructionAction.Hold))).toBeInTheDocument();
        });
    });

    describe("disabled", () => {
        it("is disabled", () => {
            renderWithProviders(<ReconstructionActionButton action={ReconstructionAction.Hold} disabled/>);

            expect(screen.getByRole("button")).toBeDisabled();
        });

        it("does not call onClick when clicked", async () => {
            const onClick = vi.fn();

            renderWithProviders(<ReconstructionActionButton action={ReconstructionAction.Hold} disabled onClick={onClick}/>);

            await userEvent.click(screen.getByRole("button"));

            expect(onClick).not.toHaveBeenCalled();
        });

        it("still shows the action tooltip when the wrapper is hovered", async () => {
            renderWithProviders(<ReconstructionActionButton action={ReconstructionAction.Hold} disabled/>);

            await userEvent.hover(screen.getByRole("button").parentElement);

            expect(await screen.findByText(actionTooltip(ReconstructionAction.Hold))).toBeInTheDocument();
        });
    });
});

describe("actionIcon", () => {
    const members = Object.values(ReconstructionAction).filter((v): v is ReconstructionAction => typeof v === "number");

    it.each(members)("has an icon for %s", action => {
        expect(actionIcon(action)).toBeTruthy();
    });
});
