import {User} from "../models/user";
import {PhaseFailure, Reconstruction} from "../models/reconstruction";
import {ReconstructionStatus} from "../models/reconstructionStatus";
import {AtlasReconstructionStatus} from "../models/atlasReconstructionStatus";

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
