import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeReconstruction} from "../../test/fixtures";
import {ReconstructionUpload} from "./ReconstructionUpload";
import {errorNotification, successNotification} from "./NotificationHelper";
import {AnnotationStatus} from "../../models/annotationStatus";
import {ReconstructionSpace} from "../../models/reconstructionSpace";
import {UPLOAD_RAW_SWC_MUTATION, UPLOAD_SWC_MUTATION} from "../../graphql/annotation";
import {RawReconstructionUploadStatus} from "../../models/rawReconstructionUpload";
import {GraphQLError} from "graphql";

// The preview hosts a three.js viewer and imports client/index.tsx.
vi.mock("./ReconstructionFilePreview", () => ({ReconstructionFilePreview: () => null}));
vi.mock("./NotificationHelper");

const dropPrompt = "Drop a specimen-space SWC reconstruction file, or click to browse for a file.";

const disabledMessage = "Uploads are unavailable at this status.";

const reconstruction = makeReconstruction({status: AnnotationStatus.InProgress});

function swcFile() {
    return new File(["1 1 0 0 0 1 -1"], "neuron.swc");
}

function fileInput(container: HTMLElement): HTMLInputElement {
    return container.querySelector("input[type=file]");
}

function uploadElement(disabled?: boolean) {
    return <ReconstructionUpload reconstruction={reconstruction} space={ReconstructionSpace.Specimen} disabled={disabled}
                                 disabledMessage={disabled ? disabledMessage : undefined}/>;
}

describe("ReconstructionUpload", () => {
    it("accepts a file when enabled", async () => {
        const {container} = renderWithProviders(uploadElement());

        expect(screen.getAllByText(dropPrompt).length).toBeGreaterThan(0);

        await userEvent.upload(fileInput(container), swcFile());

        expect((await screen.findAllByText("neuron.swc")).length).toBeGreaterThan(0);
        expect(screen.getByRole("button", {name: "Upload"})).toBeEnabled();
    });

    it("shows the reason and captures no file when disabled", async () => {
        const {container} = renderWithProviders(uploadElement(true));

        expect(screen.getAllByText(disabledMessage).length).toBeGreaterThan(0);
        expect(screen.queryByText(dropPrompt)).toBeNull();

        await userEvent.upload(fileInput(container), swcFile());

        expect(screen.queryByText("neuron.swc")).toBeNull();
        expect(screen.getByRole("button", {name: "Upload"})).toBeDisabled();
    });

    // The page keys the panel by reconstruction id, so a poll that moves the same reconstruction into review keeps
    // this instance and whatever file it holds.
    it("drops a chosen file when it becomes disabled", async () => {
        const {container, rerender} = renderWithProviders(uploadElement());

        await userEvent.upload(fileInput(container), swcFile());

        expect((await screen.findAllByText("neuron.swc")).length).toBeGreaterThan(0);

        rerender(uploadElement(true));

        await waitFor(() => expect(screen.queryByText("neuron.swc")).toBeNull());
        expect(screen.getAllByText(disabledMessage).length).toBeGreaterThan(0);
        expect(screen.getByRole("button", {name: "Upload"})).toBeDisabled();

        rerender(uploadElement());

        expect(screen.getAllByText(dropPrompt).length).toBeGreaterThan(0);
        expect(screen.queryByText("neuron.swc")).toBeNull();
        expect(screen.getByRole("button", {name: "Upload"})).toBeDisabled();
    });

    it("names the reconstruction when the upload is unauthorized", async () => {
        const mocks = [{
            request: {query: UPLOAD_SWC_MUTATION},
            variableMatcher: () => true,
            error: Object.assign(new Error("Unauthorized"), {statusCode: 401})
        }];

        const {container} = renderWithProviders(uploadElement(), {mocks});

        await userEvent.upload(fileInput(container), swcFile());

        await userEvent.click(await screen.findByRole("button", {name: "Upload"}));

        await waitFor(() => expect(errorNotification).toHaveBeenCalledWith("Unauthorized",
            "You are not authorized to upload the specimen-space reconstruction for Neuron rec-1."));
    });
});

describe("ReconstructionUpload (raw)", () => {
    const rawElement = <ReconstructionUpload reconstruction={reconstruction} space={ReconstructionSpace.Specimen} raw/>;

    it("offers to replace an existing raw reconstruction", async () => {
        const withRaw = {...reconstruction, rawReconstruction: {id: "raw-1"}};

        const {container} = renderWithProviders(<ReconstructionUpload reconstruction={withRaw} space={ReconstructionSpace.Specimen} raw/>);

        await userEvent.upload(fileInput(container), swcFile());

        expect(await screen.findByRole("button", {name: "Replace"})).toBeEnabled();
    });

    function attempt(status: RawReconstructionUploadStatus, failureMessage: string = null) {
        return {
            __typename: "RawReconstructionUpload",
            id: "attempt-1",
            annotationId: reconstruction.id,
            attemptNumber: 1,
            status,
            sourceFilename: "neuron.swc",
            failureMessage
        };
    }

    async function upload(mocks: any[]) {
        vi.mocked(successNotification).mockClear();
        vi.mocked(errorNotification).mockClear();

        const {container} = renderWithProviders(rawElement, {mocks});

        expect(screen.getAllByText("Drop a raw specimen-space SWC reconstruction file, or click to browse for a file.").length).toBeGreaterThan(0);

        await userEvent.upload(fileInput(container), swcFile());

        await userEvent.click(await screen.findByRole("button", {name: "Upload"}));
    }

    it("notifies success when the attempt is accepted", async () => {
        await upload([{
            request: {query: UPLOAD_RAW_SWC_MUTATION},
            variableMatcher: () => true,
            result: {data: {uploadRawSwcData: attempt(RawReconstructionUploadStatus.Accepted)}}
        }]);

        await waitFor(() => expect(successNotification).toHaveBeenCalledWith("Raw Reconstruction Uploaded",
            "The raw reconstruction for Neuron rec-1 was accepted."));
        expect(errorNotification).not.toHaveBeenCalled();
    });

    it("notifies failure when the returned attempt is not accepted", async () => {
        await upload([{
            request: {query: UPLOAD_RAW_SWC_MUTATION},
            variableMatcher: () => true,
            result: {data: {uploadRawSwcData: attempt(RawReconstructionUploadStatus.FailedUpload, "A soma was not found in the uploaded file.")}}
        }]);

        await waitFor(() => expect(errorNotification).toHaveBeenCalledWith("Raw Reconstruction Upload Failed",
            "A soma was not found in the uploaded file."));
        expect(successNotification).not.toHaveBeenCalled();
    });

    it("notifies failure with the API's reason when the upload errors", async () => {
        await upload([{
            request: {query: UPLOAD_RAW_SWC_MUTATION},
            variableMatcher: () => true,
            result: {errors: [new GraphQLError("A soma was not found in the uploaded file.")]}
        }]);

        await waitFor(() => expect(errorNotification).toHaveBeenCalledWith("Raw Reconstruction Upload Failed",
            "The raw reconstruction for Neuron rec-1 was not accepted: A soma was not found in the uploaded file."));
        expect(successNotification).not.toHaveBeenCalled();
    });
});
