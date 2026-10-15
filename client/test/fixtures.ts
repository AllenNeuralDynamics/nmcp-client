import {User} from "../models/user";
import {PhaseFailure, Reconstruction} from "../models/reconstruction";
import {ReconstructionStatus} from "../models/reconstructionStatus";
import {AtlasReconstructionStatus} from "../models/atlasReconstructionStatus";
import {AtlasKFamilyId, AtlasKindId, AtlasKindShape} from "../models/atlasKind";
import {AtlasStructureShape} from "../models/atlasStructure";
import {AtlasShape} from "../models/atlas";
import {ConstantsQueryResponse} from "../graphql/constants";
import {DataConstants} from "../models/constants";

export function makeUser(permissions: number, id: string = "user-1"): User {
    return {
        id,
        authDirectoryId: `auth-${id}`,
        firstName: "Test",
        lastName: "User",
        emailAddress: `${id}@example.com`,
        affiliation: "",
        permissions
    };
}

type ReconstructionFixture = {
    id?: string;
    status: ReconstructionStatus;
    childStatus?: AtlasReconstructionStatus;
    annotatorId?: string;
    phaseFailure?: PhaseFailure | null;
};

export function makeReconstruction({id = "rec-1", status, childStatus = AtlasReconstructionStatus.Initialized, annotatorId = "user-1", phaseFailure = null}: ReconstructionFixture): Reconstruction {
    const nodeCount = {total: 10, soma: 1, path: 5, branch: 2, end: 2};

    return {
        id,
        status,
        annotatorId,
        annotator: makeUser(0, annotatorId),
        phaseFailure,
        neuron: {
            id: `neuron-${id}`,
            label: `Neuron ${id}`,
            specimen: {id: "specimen-1", label: "Specimen 1"},
            atlasStructure: {id: "structure-1", name: "Structure 1"},
            atlasSoma: {x: 1, y: 2, z: 3}
        },
        atlasReconstruction: {
            id: `atlas-${id}`,
            status: childStatus,
            nodeCounts: {axon: nodeCount, dendrite: nodeCount}
        }
    } as unknown as Reconstruction;
}

export const MouseKind: AtlasKindShape = {
    id: "kind-mouse",
    name: "Mouse",
    description: "",
    kind: AtlasKindId.Mouse,
    family: AtlasKFamilyId.Mouse
};

export const MarmosetKind: AtlasKindShape = {
    id: "kind-marmoset",
    name: "Marmoset",
    description: "",
    kind: 200 as AtlasKindId,
    family: 200 as AtlasKFamilyId
};

export function makeStructure(atlasId: string, structureId: number, name: string, parentStructureId: number, depth: number, hasGeometry: boolean): AtlasStructureShape {
    return {
        id: `${atlasId}-${structureId}`,
        name,
        depth,
        acronym: name.split(" ")[0],
        aliases: [],
        structureId,
        structureIdPath: "",
        parentStructureId,
        defaultColor: "AABBCC",
        hasGeometry,
        atlasId
    };
}

export function makeMouseAtlasShape(): AtlasShape {
    const id = "atlas-ccf";

    return {
        id,
        name: "CCFv3",
        description: "",
        reference: "",
        geometryUrl: "precomputed://gs://ccf",
        rootStructureId: 997,
        atlasKindId: MouseKind.id,
        atlasStructures: [
            makeStructure(id, 997, "Whole Brain", null, 0, true),
            makeStructure(id, 8, "Grey", 997, 1, true),
            makeStructure(id, 315, "Isocortex", 8, 2, true),
            makeStructure(id, 304325711, "retina", 997, 1, true),
            makeStructure(id, 1024, "grooves", 997, 1, true),
            makeStructure(id, 73, "ventricles", 997, 1, false)
        ]
    };
}

export function makeMarmosetAtlasShape(): AtlasShape {
    const id = "atlas-marmoset";

    return {
        id,
        name: "Marmoset population",
        description: "",
        reference: "",
        geometryUrl: "precomputed://s3://marmoset",
        rootStructureId: 1,
        atlasKindId: MarmosetKind.id,
        atlasStructures: [
            makeStructure(id, 1, "WHOLE BRAIN", null, 0, false),
            makeStructure(id, 8, "Forebrain", 1, 1, false),
            makeStructure(id, 315, "Cortex", 8, 2, true),
            makeStructure(id, 304325711, "Lobule", 1, 1, true)
        ]
    };
}

// Marmoset is listed first so tests prove "first Mouse atlas" rather than "first atlas".
export function makeConstantsResponse(atlases: AtlasShape[] = [makeMarmosetAtlasShape(), makeMouseAtlasShape()]): ConstantsQueryResponse {
    return {
        systemSettings: {apiVersion: "test", neuronCount: 0, enableExperimentalFeatures: false},
        neuronStructures: [],
        nodeStructures: [],
        queryOperators: [],
        atlasKinds: [MouseKind, MarmosetKind],
        atlases
    };
}

export function makeConstants(response: ConstantsQueryResponse = makeConstantsResponse()): DataConstants {
    const constants = new DataConstants();

    constants.load(response);

    return constants;
}

export function makeExperimentalConstants(): DataConstants {
    const response = makeConstantsResponse();

    return makeConstants({...response, systemSettings: {...response.systemSettings, enableExperimentalFeatures: true}});
}
