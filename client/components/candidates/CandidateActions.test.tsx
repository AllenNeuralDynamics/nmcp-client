import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeUser} from "../../test/fixtures";
import {CandidateActions} from "./CandidateActions";
import {UserPermissions} from "../../graphql/user";
import {OPEN_RECONSTRUCTION_MUTATION} from "../../graphql/reconstruction";
import {actionName, ReconstructionAction} from "../../models/reconstructionAction";
import {NeuronShape} from "../../models/neuron";

vi.mock("@azure/msal-react", () => ({useIsAuthenticated: () => true}));

const neuron: NeuronShape = {id: "n1", label: "N001", specimen: {id: "s1", label: "S1"} as any, reconstructions: []};

describe("CandidateActions", () => {
    it("reports the neuron once its reconstruction has started", async () => {
        const onReconstructionStarted = vi.fn();

        const mocks = [{
            request: {query: OPEN_RECONSTRUCTION_MUTATION, variables: {neuronId: "n1"}},
            result: {data: {openReconstruction: {id: "r1", __typename: "Reconstruction"}}}
        }];

        renderWithProviders(<CandidateActions neuron={neuron} showAnnotators={false} onReconstructionStarted={onReconstructionStarted}/>,
            {user: makeUser(UserPermissions.AnnotateAll), mocks});

        await userEvent.click(screen.getByRole("button", {name: actionName(ReconstructionAction.Open)}));

        await waitFor(() => expect(onReconstructionStarted).toHaveBeenCalledWith("n1"));
    });
});
