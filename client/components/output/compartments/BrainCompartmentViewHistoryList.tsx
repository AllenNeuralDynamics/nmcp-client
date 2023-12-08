import * as React from "react";
import {List, Icon} from "semantic-ui-react";

import {BrainCompartmentViewModel} from "../../../viewmodel/brainCompartmentViewModel";

interface IBrainVolumesTableRowProps {
    brainAreaViewModel: BrainCompartmentViewModel;

    onToggleCompartmentSelected(id: string): void;
    onRemoveFromHistory(viewModel: BrainCompartmentViewModel): void;
}

const BrainCompartmentViewHistoryList = (props: IBrainVolumesTableRowProps) => {
    const v = props.brainAreaViewModel;

    return (
        <List.Item style={{paddingLeft: "12px"}}>
            <List.Content floated="right">
                {v.isDisplayed ? null :
                    <Icon name="remove" color="red" onClick={() => props.onRemoveFromHistory(v)}/>
                }
            </List.Content>
            <List.Icon name={v.isDisplayed ? "check square outline" : "square outline"}
                       onClick={() => props.onToggleCompartmentSelected(v.compartment.id)}/>
            <List.Content onClick={() => props.onToggleCompartmentSelected(v.compartment.id)}>
                {v.compartment.name}
            </List.Content>
        </List.Item>
    )
};

export interface IBrainVolumesTableProps {
    visibleBrainAreas: BrainCompartmentViewModel[];

    onToggleCompartmentSelected(id: string): void;
    onRemoveFromHistory(viewModel: BrainCompartmentViewModel): void;
}

export const BrainVolumesTable = (props: IBrainVolumesTableProps) => {
    if (!props.visibleBrainAreas || props.visibleBrainAreas.length === 0) {
        return null;
    }

    const rows: any = props.visibleBrainAreas.filter(c => c.shouldIncludeInHistory).map(v => {
        return (<BrainCompartmentViewHistoryList key={`bv_${v.compartment.id}`} brainAreaViewModel={v}
                                                 onToggleCompartmentSelected={props.onToggleCompartmentSelected}
                                                 onRemoveFromHistory={props.onRemoveFromHistory}/>)
    });

    return (
        <List divided relaxed style={{margin: 0, paddingTop: "6px", paddingBottom: "6px"}}>
            {rows}
        </List>
    );
};
