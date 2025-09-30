import * as React from "react";
import {observer} from "mobx-react-lite";
import {Dropdown, Header, Icon, Popup, Table} from "semantic-ui-react";
import {SketchPicker} from 'react-color';

import {NEURON_VIEW_MODES, NeuronViewMode} from "../../../viewmodel/neuronViewMode";
import {NeuronViewModel} from "../../../viewmodel/neuronViewModel";
import {ChangeAllStructureDisplayDialog} from "./ChangeAllStructureDisplayDialog";
import {ConsensusStatus} from "../../../models/consensusStatus";
import {useState} from "react";
import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";

type position = "initial" | "inherit" | "unset" | "relative" | "absolute" | "fixed" | "static" | "sticky";

interface IOutputTableRowProps {
    neuronViewModel: NeuronViewModel;
}

export const OutputTableRow = observer((props: IOutputTableRowProps) => {
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
                          onClick={() => v.isSelected = !v.isSelected}/>
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
                                                  onChange={(color: any) => v.baseColor = color.hex}/>
                                </div>
                            </Popup.Content>

                        </Popup>
                    </div>
                </div>
            </td>
            <td style={{verticalAlign: "middle"}}>
                <Dropdown search fluid inline options={options}
                          value={props.neuronViewModel.viewMode.value}
                          onChange={(_: any, {value}) => v.viewMode = NEURON_VIEW_MODES[value as number]}/>
            </td>

            <td style={{verticalAlign: "middle"}}>
                <Icon name={v.mirror ? "check square outline" : "square outline"}
                      style={{order: 0, paddingTop: "3px", paddingRight: "14px"}}
                      onClick={() => v.mirror = !v.mirror}/>
            </td>
            <td style={{verticalAlign: "middle"}}>
                <div>
                    {v.neuron.idString}{v.neuron.consensus == ConsensusStatus.Single ? "*" : ""}
                    <Header sub color="grey">{v.neuron.sample.animalId}</Header>
                </div>
            </td>
            <td style={{verticalAlign: "middle"}}>
                {v.neuron.brainArea ? v.neuron.brainArea.acronym : "unknown"}
                <br/>
            </td>
        </tr>
    );
});

export const NeuronTable = observer(() => {
    const [showChangeAllStructureDisplayDialog, setShowChangeAllStructureDisplayDialog] = useState<boolean>(false);

    const queryViewModel = useQueryResponseViewModel();

    const onCancel = () => {
        setShowChangeAllStructureDisplayDialog(false);
    };

    const onAccept = (mode: NeuronViewMode) => {
        setShowChangeAllStructureDisplayDialog(false);
        queryViewModel.defaultNeuronViewMode = mode;
    };

    if (!queryViewModel.neuronViewModels || queryViewModel.neuronViewModels.length === 0) {
        return null;
    }

    const areAllNeuronsSelected = queryViewModel.areAllNeuronsSelected;

    const rows: any = queryViewModel.neuronViewModels.map((v) => <OutputTableRow key={`trf_${v.neuron.id}`} neuronViewModel={v}/>);

    return (
        <Table compact>
            <ChangeAllStructureDisplayDialog show={showChangeAllStructureDisplayDialog}
                                             onCancel={() => onCancel()}
                                             onAccept={(mode: NeuronViewMode) => onAccept(mode)}
                                             defaultStructureSelection={queryViewModel.defaultNeuronViewMode}/>
            <thead>
            <tr>
                <th>
                    <Icon name={areAllNeuronsSelected ? "check square outline" : "square outline"}
                          onClick={() => queryViewModel.areAllNeuronsSelected = !areAllNeuronsSelected}/>

                </th>
                <th>
                    <Icon name="edit" style={{marginRight: "6px"}}
                          onClick={() => setShowChangeAllStructureDisplayDialog(true)}/>
                    <a onClick={() => setShowChangeAllStructureDisplayDialog(true)}
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
});

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
