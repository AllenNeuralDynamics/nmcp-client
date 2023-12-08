import * as React from "react";
import {Icon, List} from "semantic-ui-react";
import {observer} from "mobx-react-lite";

import {SliceControl} from "./SliceControl";
import {TomographyConstants} from "../../tomography/tomographyConstants";
import {UserThreshold} from "./UserThreshold";
import {TomographyViewModel, SampleTomographyViewModel} from "../../store/viewModel/tomographyViewModel";

const tomographyConstants = TomographyConstants.Instance;

type TomographyCollectionViewModelProps = {
    tomography: TomographyViewModel;
}

export type TomographyViewModelProps = {
    tomography: SampleTomographyViewModel;
}

export const TomographyControls = observer<TomographyCollectionViewModelProps>(({tomography}) => (
    <div>
        <TomographyHeader tomography={tomography}/>
        {tomography.AreControlsVisible && tomography.Selection != null ?
            <TomographyPanel tomography={tomography}/> : null}
    </div>
));

const TomographyPanel = observer<TomographyCollectionViewModelProps>(({tomography}) => (
    <List divided relaxed>
        <SliceControl viewModel={tomography.Sagittal} constants={tomographyConstants.Sagittal}/>
        <SliceControl viewModel={tomography.Horizontal} constants={tomographyConstants.Horizontal}/>
        <SliceControl viewModel={tomography.Coronal} constants={tomographyConstants.Coronal}/>
        <UserThreshold tomography={tomography.Selection}/>
    </List>
));

const TomographySwapSampleButton = observer<TomographyCollectionViewModelProps>(({tomography}) => {
    return tomography.CanSwapSample ? (
        <Icon style={SwapButtonLayoutStyle(tomography)} size="small" name={tomography.Selection.IsReferenceSample ? "redo" : "undo"}
              onClick={() => tomography.swapSample()}/>) : null;
});

const TomographyHeader = observer<TomographyCollectionViewModelProps>(({tomography}) => {
    return (
        <div style={HeaderContainerStyle}>
            <TomographySwapSampleButton tomography={tomography}/>
            <h5 style={HeaderStyle}>{tomography.title}</h5>
            <Icon style={{order: 2, flexGrow: 0, verticalAlign: "middle"}}
                  name={tomography.AreControlsVisible ? "angle up" : "angle down"}
                  onClick={() => tomography.AreControlsVisible = !tomography.AreControlsVisible}/>
        </div>)
});

const HeaderContainerStyle = {
    display: "flex",
    backgroundColor: "#00a450",
    color: "white",
    height: "30px",
    margin: 0,
    padding: "6px"
};

const HeaderStyle = {
    color: "white",
    margin: "auto",
    textAlign: "center" as "center",
    order: 1,
    flexGrow: 1
};

const SwapButtonLayoutStyle = (tomography: TomographyViewModel) => {
    return {
        order: 0,
        flexGrow: 0,
        verticalAlign: "middle",
        paddingTop: "2px",
        visible: tomography.CanSwapSample ? "visible" : "hidden"
    }
};
