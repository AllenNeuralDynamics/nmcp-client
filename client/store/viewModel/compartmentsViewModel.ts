import {action, observable} from "mobx";

import {INotificationListener, PreferencesManager} from "../../util/preferencesManager";
import {ViewerMeshVersion} from "../../models/compartmentMeshSet";

export class CompartmentsViewModel implements INotificationListener {
    @observable public IsVisible: boolean = true;

    @observable public MeshVersion: ViewerMeshVersion = PreferencesManager.Instance.ViewerMeshVersion;

    public constructor() {
        PreferencesManager.Instance.addListener(this);
    }

    @action
    public ToggleMeshVersion() {
        PreferencesManager.Instance.ViewerMeshVersion = PreferencesManager.Instance.ViewerMeshVersion == ViewerMeshVersion.AibsCcf ? ViewerMeshVersion.Janelia : ViewerMeshVersion.AibsCcf;
    }

    public preferenceChanged(name: string) {
        if (name === "viewerMeshVersion") {
            this.MeshVersion = PreferencesManager.Instance.ViewerMeshVersion;
        }
    }
}
