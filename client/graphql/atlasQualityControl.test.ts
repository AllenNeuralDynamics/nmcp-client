import {describe, expect, it} from "vitest";
import {DocumentNode, FieldNode, FragmentDefinitionNode, Kind, OperationDefinitionNode, SelectionSetNode} from "graphql";

import {ATLAS_QUALITY_CONTROL_DETAIL_QUERY, AtlasQualityControlFieldsFragment} from "./atlasQualityControl";

function fragmentsOf(document: DocumentNode): Map<string, FragmentDefinitionNode> {
    return new Map(document.definitions
        .filter((d): d is FragmentDefinitionNode => d.kind === Kind.FRAGMENT_DEFINITION)
        .map(d => [d.name.value, d]));
}

function fields(selectionSet: SelectionSetNode, fragments: Map<string, FragmentDefinitionNode>): FieldNode[] {
    return selectionSet.selections.flatMap(selection => {
        switch (selection.kind) {
            case Kind.FIELD:
                return [selection];
            case Kind.FRAGMENT_SPREAD:
                return fields(fragments.get(selection.name.value).selectionSet, fragments);
            default:
                return fields(selection.selectionSet, fragments);
        }
    });
}

describe("ATLAS_QUALITY_CONTROL_DETAIL_QUERY", () => {
    const fragments = fragmentsOf(ATLAS_QUALITY_CONTROL_DETAIL_QUERY);
    const operation = ATLAS_QUALITY_CONTROL_DETAIL_QUERY.definitions.find((d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION);
    const roots = fields(operation.selectionSet, fragments);
    const wrapperFields = fields(roots[0].selectionSet, fragments);

    function namesUnder(field: string): string[] {
        return fields(wrapperFields.find(f => f.name.value === field).selectionSet, fragments).map(f => f.name.value);
    }

    it("queries atlasQualityControl", () => {
        expect(roots.map(f => f.name.value)).toEqual(["atlasQualityControl"]);
    });

    it("fetches data only for the current output", () => {
        expect(namesUnder("current")).toEqual(expect.arrayContaining(["serviceVersion", "toolVersion", "when", "data"]));
        expect(namesUnder("history")).toEqual(expect.arrayContaining(["serviceVersion", "toolVersion", "when"]));
        expect(namesUnder("history")).not.toContain("data");
    });
});

describe("AtlasQualityControlFieldsFragment", () => {
    it("is on AtlasQualityControl", () => {
        const [fragment] = fragmentsOf(AtlasQualityControlFieldsFragment).values();

        expect(fragment.typeCondition.name.value).toBe("AtlasQualityControl");
    });
});
