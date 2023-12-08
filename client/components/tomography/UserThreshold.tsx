import * as React from "react";
import {observer} from "mobx-react-lite";
import {Button, Checkbox, List, Header, Icon} from "semantic-ui-react";
import {TomographyViewModelProps} from "./TomographyPanel";
import {useEffect, useState} from "react";

const Slider = require("rc-slider");

const buttonIncrement = 25;

export const UserThreshold = observer<TomographyViewModelProps>(({tomography}) => {
    return (
        <List.Item style={{paddingLeft: "12px", paddingBottom: "12px"}}>
            <List.Header>
                <CustomThresholdHeader tomography={tomography}/>
            </List.Header>
            {tomography.UseCustomThreshold ?
                <List.Content style={{padding: "10px 18px 8px 8px"}}>
                    <CustomThresholdContent tomography={tomography}/>
                </List.Content> : null}
        </List.Item>
    );
});

const CustomThresholdHeader = observer<TomographyViewModelProps>(({tomography}) => (
    <div style={{display: "flex"}}>
        <Checkbox toggle checked={tomography.UseCustomThreshold} label="Custom Threshold" style={{flexGrow: 1}}
                  onChange={() => tomography.UseCustomThreshold = !tomography.UseCustomThreshold}/>
        <Icon name="redo" size="small" style={{
            order: 1,
            paddingTop: "4px",
            paddingRight: "8px",
            visibility: tomography.IsCustomThreshold ? "visible" : "hidden"
        }} onClick={() => {
            tomography.resetCustomThreshold();
        }}/>
    </div>
));

const CustomThresholdContent = observer<TomographyViewModelProps>((props) => {
    // Tracks the slider value while it is in the process of being changed.  Using the view model value directly would
    // result in several requests for intermediate slices the user is not requesting.
    const [min, setMin] = useState(props.tomography.CustomThreshold.Min);
    const [max, setMax] = useState(props.tomography.CustomThreshold.Max);

    useEffect(() => {
        setMin(props.tomography.CustomThreshold.Min);
        setMax(props.tomography.CustomThreshold.Max);
    }, [props.tomography.CustomThreshold.Min, props.tomography.CustomThreshold.Max]);

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <div style={{display: "flex", alignItems: "center"}}>
                <Button.Group size="mini">
                    <Button icon="angle left"
                            onClick={() => props.tomography.incrementMinThreshold(-buttonIncrement)}/>
                    <Button icon="angle right"
                            onClick={() => props.tomography.incrementMinThreshold(buttonIncrement)}/>
                </Button.Group>
                <Slider.Range count={2}
                              min={props.tomography.CustomThresholdLimits.Min}
                              max={props.tomography.CustomThresholdLimits.Max}
                              value={[min, max]}
                              style={{flexGrow: 1, order: 1, marginLeft: "8px", marginRight: "8px"}}
                              onChange={(value: [number, number]) => {
                                  setMin(value[0]);
                                  setMax(value[1]);
                              }}
                              onAfterChange={(value: [number, number]) => {
                                  props.tomography.updateCustomThreshold(value);
                              }}/>
                <Button.Group size="mini" style={{order: 2}}>
                    <Button icon="angle left"
                            onClick={() => props.tomography.incrementMaxThreshold(-buttonIncrement)}/>
                    <Button icon="angle right"
                            onClick={() => props.tomography.incrementMaxThreshold(buttonIncrement)}/>
                </Button.Group>
            </div>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "4px",
                paddingRight: "2px"
            }}>
                <div style={{order: 0}}>
                    <Header as="h5">{props.tomography.CustomThreshold.Min}</Header>
                </div>
                <div style={{order: 1}}>
                    <Header as="h5">{props.tomography.CustomThreshold.Max}</Header>
                </div>
            </div>
        </div>
    )
});