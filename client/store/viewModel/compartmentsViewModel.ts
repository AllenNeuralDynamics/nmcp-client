import {makeObservable, observable} from "mobx";

import {ViewerMeshVersion} from "../../models/compartmentMeshSet";

export class CompartmentsViewModel {
    public IsVisible: boolean = true;

    public MeshVersion: ViewerMeshVersion = ViewerMeshVersion.AibsCcf;

    public constructor() {
        makeObservable(this, {IsVisible: observable, MeshVersion: observable});
    }
}
