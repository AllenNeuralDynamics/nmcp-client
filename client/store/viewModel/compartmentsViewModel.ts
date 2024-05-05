import {observable} from "mobx";

import {ViewerMeshVersion} from "../../models/compartmentMeshSet";

export class CompartmentsViewModel {
    @observable public IsVisible: boolean = true;

    @observable public MeshVersion: ViewerMeshVersion = ViewerMeshVersion.AibsCcf;

    public constructor() {
    }
}
