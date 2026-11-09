import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";

import {renderWithProviders} from "../../test/render";
import {ATLAS_QUALITY_CONTROL_DETAIL_QUERY} from "../../graphql/atlasQualityControl";
import {AtlasQualityControlStatus} from "../../models/atlasQualityControlStatus";
import {QualityMetrics} from "./QualityMetrics";
import {v3Data} from "../../test/qualityControlFixtures";

function detailMock(serviceVersion: number, data: object, toolVersion = "0.5.1") {
    return [{
        request: {query: ATLAS_QUALITY_CONTROL_DETAIL_QUERY, variables: {id: "qc-1"}},
        result: {
            data: {
                atlasQualityControl: {
                    __typename: "AtlasQualityControl",
                    id: "qc-1",
                    status: AtlasQualityControlStatus.Failed,
                    current: {__typename: "QualityOutput", serviceVersion, toolVersion, when: 1762700000000, data},
                    history: [{__typename: "QualityOutput", serviceVersion: 2, toolVersion: "0.5.0", when: 1762600000000}]
                }
            }
        }
    }];
}

describe("QualityMetrics", () => {
    it("shows v2 output from atlasQualityControl", async () => {
        renderWithProviders(<QualityMetrics qualityControlId="qc-1"/>, {
            mocks: detailMock(2, {errors: [{name: "Dangling Nodes", description: "Nodes without a parent", nodes: [1, 2]}]})
        });

        expect(await screen.findByText("Standard Morph version: 0.5.1")).toBeTruthy();
        expect(screen.getByText("Failed")).toBeTruthy();
        expect(screen.getByText("Dangling Nodes")).toBeTruthy();
        expect(screen.getByText("1 prior result available")).toBeTruthy();
    });

    it("shows v3 output for standard-morph 1.x", async () => {
        renderWithProviders(<QualityMetrics qualityControlId="qc-1"/>, {mocks: detailMock(3, v3Data, "1.0.2")});

        expect(await screen.findByText("Failed: 1")).toBeTruthy();
        expect(screen.getByText("Duplicate Node Coordinates")).toBeTruthy();
    });

    it("shows the newer-version message for a later standard-morph major version", async () => {
        renderWithProviders(<QualityMetrics qualityControlId="qc-1"/>, {mocks: detailMock(3, v3Data, "2.0.0")});

        expect(await screen.findByText("Quality control content is from a newer version and can't be displayed yet.")).toBeTruthy();
    });

    it("says when there is no quality control", () => {
        renderWithProviders(<QualityMetrics/>);

        expect(screen.getByText("Quality control has not been created for this neuron.")).toBeTruthy();
    });
});
