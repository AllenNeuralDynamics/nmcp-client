import {describe, expect, it} from "vitest";
import {DocumentNode, FieldNode, OperationDefinitionNode, print, VariableNode} from "graphql";

import {CANDIDATE_NEURON_LOCATIONS_QUERY, CANDIDATE_NEURON_OFFSET_QUERY, CANDIDATE_NEURONS_QUERY} from "./candidates";

function operationOf(document: DocumentNode): OperationDefinitionNode {
    return document.definitions.find(d => d.kind == "OperationDefinition") as OperationDefinitionNode;
}

function fieldOf(document: DocumentNode, name: string): FieldNode {
    return operationOf(document).selectionSet.selections.find(s => s.kind == "Field" && s.name.value == name) as FieldNode;
}

function declaredType(document: DocumentNode, variable: string): string {
    const definition = operationOf(document).variableDefinitions.find(v => v.variable.name.value == variable);

    return definition ? print(definition.type) : undefined;
}

function passedVariable(document: DocumentNode, field: string, argument: string): string {
    const value = fieldOf(document, field).arguments.find(a => a.name.value == argument)?.value;

    return value?.kind == "Variable" ? (value as VariableNode).name.value : undefined;
}

// The server ignores an undeclared variable without an error, so a missing declaration would silently fall back to
// the API's default exclusions, and the table, the viewer and the offset lookup would disagree on the candidate set.
describe.each([
    ["CANDIDATE_NEURONS_QUERY", CANDIDATE_NEURONS_QUERY, "candidateNeurons"],
    ["CANDIDATE_NEURON_LOCATIONS_QUERY", CANDIDATE_NEURON_LOCATIONS_QUERY, "candidateNeuronLocations"],
    ["CANDIDATE_NEURON_OFFSET_QUERY", CANDIDATE_NEURON_OFFSET_QUERY, "candidateNeuronOffset"]
])("%s", (_, document, field) => {
    it("declares excludedReconstructionStatuses as [Int!]", () => {
        expect(declaredType(document, "excludedReconstructionStatuses")).toBe("[Int!]");
    });

    it("passes the filter variables to the field", () => {
        expect(passedVariable(document, field, "excludedReconstructionStatuses")).toBe("excludedReconstructionStatuses");
        expect(passedVariable(document, field, "includeInProgress")).toBe("includeInProgress");
        expect(passedVariable(document, field, "input")).toBe("input");
    });
});

describe("CANDIDATE_NEURON_OFFSET_QUERY", () => {
    it("declares and passes the neuron id", () => {
        expect(declaredType(CANDIDATE_NEURON_OFFSET_QUERY, "id")).toBe("String!");
        expect(passedVariable(CANDIDATE_NEURON_OFFSET_QUERY, "candidateNeuronOffset", "id")).toBe("id");
    });
});

describe("CANDIDATE_NEURON_LOCATIONS_QUERY", () => {
    it("declares and passes the cursor", () => {
        expect(declaredType(CANDIDATE_NEURON_LOCATIONS_QUERY, "after")).toBe("String");
        expect(passedVariable(CANDIDATE_NEURON_LOCATIONS_QUERY, "candidateNeuronLocations", "after")).toBe("after");
    });
});
