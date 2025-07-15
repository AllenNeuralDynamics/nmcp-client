import * as React from "react";
import {Icon, List, SemanticICONS} from "semantic-ui-react";

import {IBrainArea} from "../../../models/brainArea";
import {BrainCompartmentViewModel} from "../../../viewmodel/brainCompartmentViewModel";

export class CompartmentNode {
    name: string;
    toggled: boolean;
   // isChecked: boolean;
    children: CompartmentNode[];
    compartment: IBrainArea;

    matches(str: string): boolean {
        let matches: boolean = this.name.toLowerCase().includes(str);

        if (!matches) {
            matches = this.compartment.acronym.toLowerCase().includes(str);
        }

        if (!matches && this.compartment.aliasList?.length > 0) {
            matches = this.compartment.aliasList.some(a => a.includes(str));
        }

        return matches;
    }
}

type CompartmentNodeProps = {
    compartmentNode: CompartmentNode;
    compartmentOnly: boolean;
    visibleBrainAreas: BrainCompartmentViewModel[];

    onToggle?(node: CompartmentNode): void;
    onSelect(node: CompartmentNode, select: boolean): void;
}

export function CompartmentNodeView(props: CompartmentNodeProps) {
    const getIconName = (): SemanticICONS => {
        if (props.compartmentOnly) {
            return "file";
        }

        if (props.compartmentNode.toggled) {
            return "folder open";
        }

        return props.compartmentNode.children && props.compartmentNode.children.length > 0 ? "folder" : "file";
    };

    let items = null;

    if (props.compartmentNode.toggled && !props.compartmentOnly && props.compartmentNode.children) {
        items = (
            <List.List>
                {props.compartmentNode.children.map(c => (
                    <CompartmentNodeView key={c.name} compartmentNode={c}
                                         compartmentOnly={props.compartmentOnly}
                                         visibleBrainAreas={props.visibleBrainAreas}
                                         onToggle={props.onToggle}
                                         onSelect={props.onSelect}/>
                ))}
            </List.List>
        );
    }

    const isSelected = props.visibleBrainAreas.some(c => c.compartment.id === props.compartmentNode.compartment.id && c.isDisplayed);

    return (
        <List.Item>
            <List.Icon name={getIconName()} onClick={() => {if (props.onToggle) {props.onToggle(props.compartmentNode);}}}/>
            <List.Content>
                <List.Description onClick={() => props.onSelect(props.compartmentNode, !isSelected)}>
                    <Icon name={isSelected ? "check square outline" : "square outline"}/>
                    {props.compartmentNode.name}
                </List.Description>
                {items}
            </List.Content>
        </List.Item>
    );
}
