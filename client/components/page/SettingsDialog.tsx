import * as React from "react";
import {observer} from "mobx-react-lite";
import {Button, Form, Grid, Modal} from "semantic-ui-react";
import {SketchPicker} from 'react-color';

const Slider = require("rc-slider").default;

import {PreferencesManager} from "../../util/preferencesManager";
import {CompartmentMeshSet, ViewerMeshVersion} from "../../models/compartmentMeshSet";
import {NdbConstants} from "../../models/constants";
import {CompartmentMeshSetSelect} from "../editors/CompartmentMeshSetSelect";
import {useStore, useViewModel} from "../app/App";
import {SearchScope} from "../../models/uiQueryPredicate";

export const SettingsDialogContainer = observer(() => {
    const viewModel = useViewModel();
    const {SystemConfiguration, Constants} = useStore();

    return <SettingsDialog show={viewModel.Settings.IsSettingsWindowOpen} constants={Constants}
                           isPublicRelease={SystemConfiguration.searchScope >= SearchScope.Public}
                           onHide={() => viewModel.Settings.closeSettingsDialog()}/>;
});

interface ISettingsDialogProps {
    show: boolean
    isPublicRelease: boolean;
    constants: NdbConstants;

    onHide(): void;
}

interface ISettingsDialogState {
    shouldAutoCollapseOnQuery?: boolean;
    shouldAlwaysShowSoma?: boolean;
    shouldAlwaysShowFullTracing?: boolean;
    displayColorPicker?: boolean;
    compartmentMeshVersion?: ViewerMeshVersion;
}

class SettingsDialog extends React.Component<ISettingsDialogProps, ISettingsDialogState> {
    public constructor(props: ISettingsDialogProps) {
        super(props);

        this.state = {
            shouldAutoCollapseOnQuery: PreferencesManager.Instance.ShouldAutoCollapseOnQuery,
            shouldAlwaysShowSoma: PreferencesManager.Instance.ShouldAlwaysShowSoma,
            shouldAlwaysShowFullTracing: PreferencesManager.Instance.ShouldAlwaysShowFullTracing,
            displayColorPicker: false
        };
    }

    public componentWillReceiveProps(props: ISettingsDialogProps) {
        this.setState({
            shouldAutoCollapseOnQuery: PreferencesManager.Instance.ShouldAutoCollapseOnQuery,
            shouldAlwaysShowSoma: PreferencesManager.Instance.ShouldAlwaysShowSoma,
            shouldAlwaysShowFullTracing: PreferencesManager.Instance.ShouldAlwaysShowFullTracing
        });
    }

    private onSetAutoCollapseOnQuery(b: boolean) {
        PreferencesManager.Instance.ShouldAutoCollapseOnQuery = b;
        this.setState({shouldAutoCollapseOnQuery: b});
    }

    private onSetAlwaysShowSoma(b: boolean) {
        PreferencesManager.Instance.ShouldAlwaysShowSoma = b;
        this.setState({shouldAlwaysShowSoma: b});
    }

    private onSetAlwaysShowFullTracing(b: boolean) {
        PreferencesManager.Instance.ShouldAlwaysShowFullTracing = b;
        this.setState({shouldAlwaysShowFullTracing: b});
    }

    private onAfterChangeOpacity(value: number) {
        PreferencesManager.Instance.TracingSelectionHiddenOpacity = value;
    }

    private onSetTracingFetchBatchSize(value: number) {
        PreferencesManager.Instance.TracingFetchBatchSize = value;
    }

    private handleClick() {
        this.setState({displayColorPicker: !this.state.displayColorPicker})
    }

    private handleClose() {
        this.setState({displayColorPicker: false})
    }

    private onChangeNeuronColor(color) {
        PreferencesManager.Instance.ViewerBackgroundColor = color.hex;
    }

    public render() {
        const rowStyles = {
            color: {
                width: "16px",
                height: "16px",
                borderRadius: "2px",
                background: PreferencesManager.Instance.ViewerBackgroundColor,
            }
        };

        return (
            <Modal open={this.props.show} onClose={this.props.onHide} dimmer="blurring">
                <Modal.Header content="Settings"/>
                <Modal.Content>
                    <Form>
                        <Form.Checkbox width={16} checked={this.state.shouldAutoCollapseOnQuery}
                                       label="Collapse query after search"
                                       onChange={(evt: any) => this.onSetAutoCollapseOnQuery(evt.target.checked)}/>
                        <Form.Checkbox width={16} checked={this.state.shouldAlwaysShowSoma}
                                       style={{marginTop: "10px"}}
                                       label="Always display tracing after search"
                                       onChange={(evt: any) => this.onSetAlwaysShowSoma(evt.target.checked)}/>
                        <Form.Checkbox width={16} checked={this.state.shouldAlwaysShowFullTracing}
                                       style={{marginLeft: "26px"}}
                                       disabled={!this.state.shouldAlwaysShowSoma}
                                       label="Display full tracing in addition to soma"
                                       onChange={(evt: any) => this.onSetAlwaysShowFullTracing(evt.target.checked)}/>
                    </Form>

                    <div style={{display: "flex", flexDirection: "row", alignItems: "center", marginTop: "20px"}}>
                        <div style={styles.swatch} onClick={() => this.handleClick()}>
                            <div style={rowStyles.color}/>
                        </div>
                        {this.state.displayColorPicker ? <div style={styles.popover}>
                            <div style={styles.cover} onClick={() => this.handleClose()}/>
                            <SketchPicker color={PreferencesManager.Instance.ViewerBackgroundColor}
                                          onChange={(color: any) => this.onChangeNeuronColor(color)}/>
                        </div> : null}
                        <span style={styles.text}> Viewer background color</span>
                    </div>

                    {!this.props.isPublicRelease ?
                        <div style={{paddingTop: "20px"}}>
                            <label>Tracing fetch batch size (requires page refresh)</label>
                            <div style={{
                                width: "100%",
                                paddingLeft: "30px",
                                paddingRight: "20px",
                                marginBottom: "20px"
                            }}>
                                <Slider onAfterChange={(value) => this.onSetTracingFetchBatchSize(value)} min={1}
                                        max={20}
                                        step={1}
                                        marks={{1: "1", 5: "5", 10: "10", 15: "15", 20: "20"}}
                                        defaultValue={PreferencesManager.Instance.TracingFetchBatchSize}/>
                            </div>
                        </div> : null}
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.props.onHide}>Close</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

type position = "initial" | "inherit" | "unset" | "relative" | "absolute" | "fixed" | "static" | "sticky";
type zIndex = number | "initial" | "inherit" | "unset" | "auto";

const styles = {
    swatch: {
        padding: "4px",
        background: "#efefef",
        borderRadius: "2px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        order: 1,
        flex: "0 0 auto",
        cursor: "pointer",
    },
    popover: {
        position: "absolute" as position,
        zIndex: "1000" as zIndex,
    },
    cover: {
        position: "fixed" as position,
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "-200px",
    },
    text: {
        paddingLeft: "10px",
        order: 2,
        flex: "0 0 auto",
    }
};
