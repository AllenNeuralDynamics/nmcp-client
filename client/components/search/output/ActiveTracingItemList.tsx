import {NeuronViewModel} from "../../../viewmodel/neuronViewModel";
import {NEURON_VIEW_MODE_SOMA, NEURON_VIEW_MODES, NeuronViewMode} from "../../../viewmodel/neuronViewMode";
import * as React from "react";
import {IBrainArea} from "../../../models/brainArea";
import {TracingStructure} from "../../../models/tracingStructure";
import {Dropdown, Icon, List, MenuItem, Popup} from "semantic-ui-react";

/*
Originally part of the ViewSelection overlay.  Allows for a subselection of tracings among the visible tracings so that
the other can be dimmed.  Can also cycle through each in the active tracings list and individually highlight.  This needs
to be reworked in neuroglancer.
 */

interface IActiveTracingItemProps {
    viewModel: NeuronViewModel;
    isSelected: boolean;

    lookupBrainArea(id: string | number): IBrainArea;

    onRemoveFromHistory(neuron: NeuronViewModel): void;

    onToggleLoadedGeometry(id: string): void;

    onToggleTracing(id: string): void;

    onSetHighlightedNeuron(neuron: NeuronViewModel): void;

    onChangeNeuronViewMode(neuron: NeuronViewModel, viewMode: NeuronViewMode): void;
}

export function ActiveTracingItemList(props: IActiveTracingItemProps) {
    const onViewModeChange = (viewMode: NeuronViewMode) => {
        props.onChangeNeuronViewMode(props.viewModel, viewMode);
    };

    const n = props.viewModel;

    const viewMode = n.viewMode;

    const soma = n.soma;

    let somaBrainAreaLabel = null;

    if (soma) {
        const somaBrainArea = props.lookupBrainArea(soma.brainStructureId);

        if (somaBrainArea) {
            let somaDisplayBrainArea = somaBrainArea;

            while (!somaDisplayBrainArea.geometryEnable) {
                somaDisplayBrainArea = props.lookupBrainArea(somaDisplayBrainArea.parentStructureId);
            }

            const somaBrainAreaTrigger = <a onClick={() => props.onToggleLoadedGeometry(somaBrainArea.id)}>
                {` ${somaBrainArea.acronym}`}
            </a>;

            somaBrainAreaLabel = (
                <Popup trigger={somaBrainAreaTrigger}
                       style={{maxHeight: "30px"}}>{somaDisplayBrainArea.name}</Popup>
            );
        }
    }

    let structureLabel = " - (soma only)";

    // If not highlighted is the proxy tracing for showing just the soma.
    if (viewMode !== NEURON_VIEW_MODE_SOMA) {
        structureLabel = "";
    }

    const options = NEURON_VIEW_MODES.slice();

    if (!n.hasDendriteTracing) {
        options.splice(2, 1);
    }

    if (!n.hasAxonTracing) {
        options.splice(1, 1);
    }

    if (options.length < 4) {
        options.splice(0, 1);
    }

    const menus = options.map(o => {
        return (<MenuItem key={o.id} onClick={() => onViewModeChange(o)}>{o.id}</MenuItem>);
        // return (<MenuItem key={o.id} eventKey={o}>{o.id}</MenuItem>);
    });

    return (
        <List.Item active={props.isSelected}>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <div style={{flex: "1 1 auto", order: 1}} onClick={() => props.onSetHighlightedNeuron(n)}>
                    {`${n.neuron.idString}${structureLabel} `}
                </div>
                <Dropdown options={menus} trigger={n.viewMode.id} style={{
                    flex: "0 0 auto",
                    order: 2,
                    width: "80px",
                    textAlign: "left"
                }}/>
                <div style={{flex: "0 0 auto", order: 3, paddingRight: "10px"}}>
                    {somaBrainAreaLabel}
                </div>
                <Icon name="remove" className="pull-right"
                      style={{flex: "0 0 auto", order: 4, marginBottom: "4px"}}
                      onClick={() => props.onRemoveFromHistory(n)}/>
            </div>
        </List.Item>
    )
}
