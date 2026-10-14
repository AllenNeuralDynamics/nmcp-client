import * as React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeReconstruction} from "../../test/fixtures";
import {NeuronDownloadMenu} from "./NeuronDownloadMenu";
import {ExportFormat, ReconstructionSpace} from "../../models/neuron";
import {Reconstruction} from "../../models/reconstruction";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {requestExport} from "../../services/exportService";
import {errorNotification, infoNotification} from "../common/NotificationHelper";

vi.mock("../../services/exportService", () => ({requestExport: vi.fn(async () => true)}));
vi.mock("../common/NotificationHelper");

const SPECIMEN_SWC = "Specimen-Space SWC";
const ATLAS_SWC = "Atlas-Space SWC";
const SPECIMEN_PARQUET = "Specimen-Space Parquet";
const ATLAS_PARQUET = "Atlas-Space Parquet";

const specimenOnly = makeReconstruction({status: ReconstructionStatus.Published});

const bothSpaces: Reconstruction = {...specimenOnly, specimenNodeCounts: specimenOnly.atlasReconstruction.nodeCounts};

const atlasUnavailable: Reconstruction = {...bothSpaces, atlasReconstruction: null};

async function openMenu(reconstruction?: Reconstruction) {
    renderWithProviders(<NeuronDownloadMenu reconstruction={reconstruction}/>);

    await userEvent.click(screen.getByRole("button", {name: "Download"}));
}

describe("NeuronDownloadMenu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("lists SWC then Parquet for each space", async () => {
        await openMenu(bothSpaces);

        const items = within(screen.getByRole("menu")).getAllByRole("menuitem").map(i => i.textContent.trim());

        expect(items).toEqual([SPECIMEN_SWC, ATLAS_SWC, SPECIMEN_PARQUET, ATLAS_PARQUET]);
    });

    it.each([
        [SPECIMEN_SWC, ["rec-1"], ExportFormat.SWC, ReconstructionSpace.Specimen],
        [ATLAS_SWC, ["atlas-rec-1"], ExportFormat.SWC, ReconstructionSpace.Atlas],
        [SPECIMEN_PARQUET, ["rec-1"], ExportFormat.Parquet, ReconstructionSpace.Specimen],
        [ATLAS_PARQUET, ["atlas-rec-1"], ExportFormat.Parquet, ReconstructionSpace.Atlas]
    ])("%s requests %j as format %s in space %s", async (label, ids, format, space) => {
        await openMenu(bothSpaces);

        await userEvent.click(await screen.findByRole("menuitem", {name: label}));

        expect(vi.mocked(requestExport)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(requestExport)).toHaveBeenCalledWith(ids, format, space);
        expect(vi.mocked(infoNotification)).toHaveBeenCalled();
    });

    it("disables both specimen-space items without specimen node counts", async () => {
        await openMenu(specimenOnly);

        expect(await screen.findByRole("menuitem", {name: SPECIMEN_SWC})).toBeDisabled();
        expect(await screen.findByRole("menuitem", {name: SPECIMEN_PARQUET})).toBeDisabled();
        expect(await screen.findByRole("menuitem", {name: ATLAS_SWC})).toBeEnabled();
        expect(await screen.findByRole("menuitem", {name: ATLAS_PARQUET})).toBeEnabled();
    });

    it("disables both atlas-space items without an atlas reconstruction", async () => {
        await openMenu(atlasUnavailable);

        expect(await screen.findByRole("menuitem", {name: ATLAS_SWC})).toBeDisabled();
        expect(await screen.findByRole("menuitem", {name: ATLAS_PARQUET})).toBeDisabled();
        expect(await screen.findByRole("menuitem", {name: SPECIMEN_SWC})).toBeEnabled();
        expect(await screen.findByRole("menuitem", {name: SPECIMEN_PARQUET})).toBeEnabled();
    });

    it("reports a failed export", async () => {
        vi.mocked(requestExport).mockResolvedValueOnce(false);

        await openMenu(bothSpaces);

        await userEvent.click(await screen.findByRole("menuitem", {name: ATLAS_PARQUET}));

        await waitFor(() => expect(vi.mocked(errorNotification)).toHaveBeenCalledWith("Export Failed", expect.any(String)));
    });

    it("disables Download without a reconstruction", () => {
        renderWithProviders(<NeuronDownloadMenu/>);

        expect(screen.getByRole("button", {name: "Download"})).toBeDisabled();
    });
});
