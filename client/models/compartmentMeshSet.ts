import {IDynamicSelectOption} from "../components/editors/DynamicSelect";

export enum ViewerMeshVersion {
    AibsCcf
}

export class CompartmentMeshSet implements IDynamicSelectOption {
    private readonly version: ViewerMeshVersion;

    public get Version(): ViewerMeshVersion {
        return this.version;
    }

    public get MeshPath(): string {
        return "/static/ccf-2017/obj/";
    }

    public get MeshRotation(): number {
        return -Math.PI / 2;
    }

    public get Name(): string {
        return "CCFv3";
    }

    public get id(): string {
        return this.Name;
    }

    public constructor(v: ViewerMeshVersion) {
        this.version = v;
    }
}
