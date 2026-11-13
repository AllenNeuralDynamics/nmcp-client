import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {Table} from "@mantine/core";

import {renderWithProviders} from "../../../test/render";
import {NeuronShape} from "../../../models/neuron";
import {NeuronViewModel} from "../../../viewmodel/neuronViewModel";
import {NeuronRow} from "./NeuronTable";

function makeNeuron(): NeuronShape {
    return {
        id: "neuron-1",
        label: "N001",
        atlasStructure: null,
        specimen: {id: "specimen-1", label: "S001", atlasId: "atlas-1"},
        published: {
            id: "published-1",
            atlasReconstruction: {id: "reconstruction-1", soma: null, precomputed: {skeletonId: 1}}
        }
    } as unknown as NeuronShape;
}

describe("NeuronRow", () => {
    it("links the neuron and its specimen to their pages", () => {
        renderWithProviders(
            <Table>
                <Table.Tbody>
                    <NeuronRow neuronViewModel={new NeuronViewModel(makeNeuron())}/>
                </Table.Tbody>
            </Table>
        );

        expect(screen.getByRole("link", {name: "N001"})).toHaveAttribute("href", "/neuron/neuron-1");
        expect(screen.getByRole("link", {name: "S001"})).toHaveAttribute("href", "/specimen/specimen-1");
    });
});
