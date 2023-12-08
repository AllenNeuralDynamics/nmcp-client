import {IDynamicSelectOption} from "../components/editors/DynamicSelect";

export enum ViewerMeshVersion {
    Janelia,
    AibsCcf
}

export class CompartmentMeshSet implements IDynamicSelectOption {
    private readonly version: ViewerMeshVersion;

    public get Version(): ViewerMeshVersion {
        return this.version;
    }

    public get MeshPath(): string {
        switch (this.version) {
            case ViewerMeshVersion.Janelia:
                return "/static/allen/obj/";
            default:
                return "/static/ccf-2017/obj/";
        }
    }

    public get MeshRotation(): number {
        switch (this.version) {
            case ViewerMeshVersion.AibsCcf:
                return -Math.PI / 2;
            default:
                return 0;
        }
    }

    public get Name(): string {
        switch (this.version) {
            case ViewerMeshVersion.AibsCcf:
                return "CCFv3";
            default:
                return "CCFv2.5 (ML legacy)";
        }
    }

    public get id(): string {
        return this.Name;
    }

    public constructor(v: ViewerMeshVersion) {
        this.version = v;
    }
}