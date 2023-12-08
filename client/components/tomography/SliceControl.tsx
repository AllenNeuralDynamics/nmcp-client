import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {Button, Checkbox, List} from "semantic-ui-react";
const Slider = require("rc-slider").default;

import {TomographyPlaneConstants} from "../../tomography/tomographyConstants";
import {SliceControlViewModel} from "../../store/viewModel/tomographyViewModel";

const sliceMovementStep = 25;

export interface ISliceControlProps {
    viewModel: SliceControlViewModel;
    constants: TomographyPlaneConstants;
}

export const SliceControl = observer((props: ISliceControlProps) => {
    // Tracks the slider value while it is in the process of being changed.  Using the view model value directly would
    // result in several requests for intermediate slices the user is not requesting.
    const [location, setLocation] = useState(props.viewModel.Location);

    return (
        <List.Item style={{paddingLeft: "12px"}}>
            <List.Header>
                <div style={{display: "flex"}}>
                    <Checkbox toggle checked={props.viewModel.IsEnabled} label={props.constants.Name}
                              onChange={() => props.viewModel.IsEnabled = !props.viewModel.IsEnabled}/>
                    <div style={{
                        flexGrow: 1,
                        textAlign: "right",
                        visibility: props.viewModel.IsEnabled ? "visible" : "hidden",
                        paddingRight: "10px"
                    }}>
                        {`${(props.viewModel.Location / 1000).toFixed(2)} mm`}
                    </div>
                </div>
            </List.Header>
            {props.viewModel.IsEnabled ?
                <List.Content style={{padding: "10px 18px 8px 8px"}}>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <Button size="mini" icon="angle left"
                                onClick={() => props.viewModel.Location = Math.min(Math.max(props.viewModel.Location - sliceMovementStep, props.constants.Min), props.constants.Max)}/>
                        <Slider min={props.constants.Min} max={props.constants.Max}
                                step={sliceMovementStep}
                                value={location}
                                style={{flexGrow: 1, order: 1, marginLeft: "4px", marginRight: "8px"}}
                                onChange={(value: number) => setLocation(value)}
                                onAfterChange={(value: number) => props.viewModel.Location = value}/>
                        <Button size="mini" icon="angle right" style={{order: 2}}
                                onClick={() => props.viewModel.Location = Math.min(Math.max(props.viewModel.Location + sliceMovementStep, props.constants.Min), props.constants.Max)}/>
                    </div>
                </List.Content> : null}
        </List.Item>
    );
});
