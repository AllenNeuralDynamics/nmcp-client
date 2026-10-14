import {describe, expect, it} from "vitest";
import {FieldNode, OperationDefinitionNode, print, VariableNode} from "graphql";

import {CANDIDATE_NEURONS_QUERY} from "./candidates";

// The server ignores an undeclared variable without an error, so a missing declaration would silently fall back to
// the API's default exclusions.
describe("CANDIDATE_NEURONS_QUERY", () => {
    const operation = CANDIDATE_NEURONS_QUERY.definitions.find(d => d.kind == "OperationDefinition") as OperationDefinitionNode;

    it("declares excludedReconstructionStatuses as [Int!]", () => {
        const variable = operation.variableDefinitions.find(v => v.variable.name.value == "excludedReconstructionStatuses");

        expect(variable).toBeDefined();
        expect(print(variable.type)).toBe("[Int!]");
    });

    it("passes the variable to candidateNeurons", () => {
        const field = operation.selectionSet.selections.find(s => s.kind == "Field" && s.name.value == "candidateNeurons") as FieldNode;

        const argument = field.arguments.find(a => a.name.value == "excludedReconstructionStatuses");

        expect(argument?.value.kind).toBe("Variable");
        expect((argument.value as VariableNode).name.value).toBe("excludedReconstructionStatuses");
    });
});
