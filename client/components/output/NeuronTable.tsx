import * as React from "react";
import {observer} from "mobx-react-lite";
import {Dropdown, Icon, Popup, Table} from "semantic-ui-react";
import {SketchPicker} from 'react-color';

import {NEURON_VIEW_MODES, NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {ChangeAllStructureDisplayDialog} from "./ChangeAllStructureDisplayDialog";
import {useViewModel} from "../app/App";
import {ConsensusStatus} from "../../models/neuron";

type position = "initial" | "inherit" | "unset" | "relative" | "absolute" | "fixed" | "static" | "sticky";
type zIndex = number | "initial" | "inherit" | "unset" | "auto";

interface IOutputTableRowProps {
    neuronViewModel: NeuronViewModel;

    onChangeSelectTracing(id: string, b: boolean): void;

    onChangeNeuronMirror(neuron: NeuronViewModel, mirror: boolean): void;

    onChangeNeuronColor(neuron: NeuronViewModel, color: any): void;

    onChangeNeuronViewMode(neuron: NeuronViewModel, viewMode: NeuronViewMode): void;
}

export const OutputTableRow = observer((props: IOutputTableRowProps) => {
    const {Tomography} = useViewModel();

    const v = props.neuronViewModel;

    const rowStyles = {
        color: {
            width: "16px",
            height: "16px",
            borderRadius: "2px",
            background: v.baseColor
        }
    };

    const options = NEURON_VIEW_MODES.slice();

    if (!v.hasDendriteTracing) {
        options.splice(2, 1);
    }

    if (!v.hasAxonTracing) {
        options.splice(1, 1);
    }

    if (options.length < 4) {
        options.splice(0, 1);
    }

    return (
        <tr>
            <td>
                <div style={{display: "flex"}}>
                    <Icon name={v.isSelected ? "check square outline" : "square outline"}
                          style={{order: 0, paddingTop: "3px", paddingRight: "14px"}}
                          onClick={() => props.onChangeSelectTracing(v.neuron.id, !v.isSelected)}/>
                    <div style={{order: 1}}>
                        <Popup on="click"
                               trigger={
                                   <div style={styles.swatch}>
                                       <div style={rowStyles.color}/>
                                   </div>
                               }>
                            <Popup.Content>
                                <div>
                                    <div style={styles.cover}/>
                                    <SketchPicker color={v.baseColor}
                                                  onChange={(color: any) => props.onChangeNeuronColor(v, color)}/>
                                </div>
                            </Popup.Content>

                        </Popup>
                    </div>
                </div>
            </td>
            <td style={{verticalAlign: "middle"}}>
                {props.neuronViewModel.RequestedViewMode === null ?
                    <Dropdown search fluid inline options={options}
                              value={props.neuronViewModel.CurrentViewMode.value}
                              onChange={(e: any, {value}) => props.onChangeNeuronViewMode(props.neuronViewModel, NEURON_VIEW_MODES[value as number])}/> :
                    <span>Loading...</span>}
            </td>

            <td style={{verticalAlign: "middle"}}>
                <Icon name={v.mirror ? "check square outline" : "square outline"}
                      style={{order: 0, paddingTop: "3px", paddingRight: "14px"}}
                      onClick={() => props.onChangeNeuronMirror(v, !v.mirror)}/>
            </td>
            <td style={{verticalAlign: "middle"}}>
                {v.neuron.idString}{v.neuron.consensus == ConsensusStatus.Single ? "*" : ""}
            </td>
            <td style={{verticalAlign: "middle"}}>
                {v.neuron.brainArea ? v.neuron.brainArea.acronym : "unknown"}
                <br/>
            </td>
            <td>
                <Icon size="small" name="clone" onClick={() => Tomography.setSample(v.neuron.sample)}/>
            </td>
        </tr>
    );
});

export interface INeuronTableProps {
    isAllTracingsSelected: boolean;
    neuronViewModels: NeuronViewModel[];
    defaultStructureSelection: NeuronViewMode;

    onChangeSelectTracing(id: string, b: boolean): void;

    onChangeNeuronColor(neuron: NeuronViewModel, color: any): void;

    onChangeNeuronMirror(neuron: NeuronViewModel, mirror: boolean): void;

    onChangeNeuronViewMode(neuron: NeuronViewModel, viewMode: NeuronViewMode): void;

    onChangeSelectAllTracings(selectAll: boolean): void;

    onChangeDefaultStructure(mode: NeuronViewMode): void;
}

interface IOutputTableState {
    showChangeAllStructureDisplayDialog: boolean
}

export class NeuronTable extends React.Component<INeuronTableProps, IOutputTableState> {
    public constructor(props: INeuronTableProps) {
        super(props);

        this.state = {
            showChangeAllStructureDisplayDialog: false
        };
    }

    public onCancel() {
        this.setState({showChangeAllStructureDisplayDialog: false})
    }

    public onAccept(mode: NeuronViewMode) {
        this.setState({showChangeAllStructureDisplayDialog: false});
        this.props.onChangeDefaultStructure(mode);
    }

    public render() {
        if (!this.props.neuronViewModels || this.props.neuronViewModels.length === 0) {
            return null;
        }

        const rows: any = this.props.neuronViewModels.map((v, idx) => {
            return (<OutputTableRow key={`trf_${v.neuron.id}`} neuronViewModel={v}
                                    onChangeNeuronColor={this.props.onChangeNeuronColor}
                                    onChangeNeuronMirror={this.props.onChangeNeuronMirror}
                                    onChangeSelectTracing={this.props.onChangeSelectTracing}
                                    onChangeNeuronViewMode={this.props.onChangeNeuronViewMode}/>)
        });

        return (
            <Table compact>
                <ChangeAllStructureDisplayDialog show={this.state.showChangeAllStructureDisplayDialog}
                                                 onCancel={() => this.onCancel()}
                                                 onAccept={(mode: NeuronViewMode) => this.onAccept(mode)}
                                                 defaultStructureSelection={this.props.defaultStructureSelection}/>
                <thead>
                <tr>
                    <th>
                        <Icon name={this.props.isAllTracingsSelected ? "check square outline" : "square outline"}
                              onClick={() => this.props.onChangeSelectAllTracings(!this.props.isAllTracingsSelected)}/>

                    </th>
                    <th>
                        <Icon name="edit" style={{marginRight: "6px"}}
                              onClick={() => this.setState({showChangeAllStructureDisplayDialog: true})}/>
                        <a onClick={() => this.setState({showChangeAllStructureDisplayDialog: true})}
                           style={{textDecoration: "underline"}}>
                            Structures
                        </a>
                    </th>
                    <th>
                        Mirror
                    </th>
                    <th>Neuron</th>
                    <th>Compartment</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
}

const styles = {
    swatch: {
        padding: "4px",
        background: "#efefef",
        borderRadius: "2px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer"
    },
    cover: {
        position: "fixed" as position,
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "-200px"
    },
};
