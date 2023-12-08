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

export class CompartmentNodeView extends React.Component<CompartmentNodeProps, {}> {
    private get IconName(): SemanticICONS {
        if (this.props.compartmentOnly) {
            return "file";
        }

        if (this.props.compartmentNode.toggled) {
            return "folder open";
        }

        return this.props.compartmentNode.children && this.props.compartmentNode.children.length > 0 ? "folder" : "file";
    }

    public render() {
        let items = null;

        if (this.props.compartmentNode.toggled && !this.props.compartmentOnly && this.props.compartmentNode.children) {
            items = (
                <List.List>
                    {this.props.compartmentNode.children.map(c => (
                        <CompartmentNodeView key={c.name} compartmentNode={c}
                                             compartmentOnly={this.props.compartmentOnly}
                                             visibleBrainAreas={this.props.visibleBrainAreas}
                                             onToggle={this.props.onToggle}
                                             onSelect={this.props.onSelect}/>
                    ))}
                </List.List>
            );
        }

        const isSelected = this.props.visibleBrainAreas.some(c => c.compartment.id === this.props.compartmentNode.compartment.id && c.isDisplayed);

        return (
            <List.Item>
                <List.Icon name={this.IconName} onClick={() => {if (this.props.onToggle) {this.props.onToggle(this.props.compartmentNode);}}}/>
                <List.Content>
                    <List.Description onClick={() => this.props.onSelect(this.props.compartmentNode, !isSelected)}>
                        <Icon name={isSelected ? "check square outline" : "square outline"}/>
                        {this.props.compartmentNode.name}
                    </List.Description>
                    {items}
                </List.Content>
            </List.Item>
        );
    }
}
