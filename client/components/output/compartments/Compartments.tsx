import * as React from "react";
import {Container, Input, List} from "semantic-ui-react";

import {CompartmentNode, CompartmentNodeView} from "./CompartmentNode";
import {compartmentNodeSortedList} from "../MainView";
import {BrainCompartmentViewModel} from "../../../viewmodel/brainCompartmentViewModel";

type CompartmentsProps = {
    rootNode: CompartmentNode;
    visibleBrainAreas: BrainCompartmentViewModel[];

    onChangeLoadedGeometry(added: string[], removed: string[]): void;
}

export function Compartments(props: CompartmentsProps) {
    const [filterText, setFilterText] = React.useState<string>("");
    const [selectedNode, setSelectedNode] = React.useState<CompartmentNode | null>(null);

    const onSelect = (node: CompartmentNode, select: boolean) => {
        const added = select ? [node.compartment.id] : [];
        const remove = select ? [] : [node.compartment.id];

        props.onChangeLoadedGeometry(added, remove);
    };

    const onToggle = (node: CompartmentNode) => {
        if (node.children) {
            node.toggled = !node.toggled;
        }

        setSelectedNode(node);
    };

    if (props.rootNode === null) {
        return null;
    }

    let list = null;

    if (filterText) {
        const items = compartmentNodeSortedList.filter(c => c.matches(filterText));

        const listItems = items.map(c => (
            <CompartmentNodeView key={c.name} compartmentNode={c}
                                 compartmentOnly={true}
                                 visibleBrainAreas={props.visibleBrainAreas}
                                 onSelect={onSelect}/>
        ));
        list = (
            <List>
                {listItems}
            </List>
        );
    } else {
        list = (
            <List>
                <CompartmentNodeView compartmentNode={props.rootNode}
                                     compartmentOnly={false}
                                     onToggle={onToggle}
                                     visibleBrainAreas={props.visibleBrainAreas}
                                     onSelect={onSelect}/>
            </List>
        );
    }

    return (
        <Container fluid>
            <div>
                <Input size="mini" icon="search" iconPosition="left" action={{icon: "cancel", as: "div", onClick: () => setFilterText("")}}
                       placeholder='Filter compartments...' fluid value={filterText} className="compartment-search"
                       onChange={(e, {value}) => setFilterText(value.toLowerCase())}/>
            </div>
            <div style={{padding: "10px"}}>
                {list}
            </div>
        </Container>
    );
}
