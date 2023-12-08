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

type CompartmentsState = {
    filterText: string;
    selectedNode: CompartmentNode;
}

export class Compartments extends React.Component<CompartmentsProps, CompartmentsState> {
    public constructor(props: CompartmentsProps) {
        super(props);

        this.state = {
            filterText: "",
            selectedNode: null
        }
    }

    public onSelect = (node: CompartmentNode, select: boolean) => {

        const added = select ? [node.compartment.id] : [];
        const remove = select ? [] : [node.compartment.id];

        this.props.onChangeLoadedGeometry(added, remove);
    };

    public onToggle = (node: CompartmentNode) => {
        if (node.children) {
            node.toggled = !node.toggled;
        }

        this.setState({selectedNode: node});
    };

    public render() {
        if (this.props.rootNode === null) {
            return null;
        }

        let list = null;

        if (this.state.filterText) {
            const items = compartmentNodeSortedList.filter(c => c.matches(this.state.filterText));

            const listItems = items.map(c => (
                <CompartmentNodeView key={c.name} compartmentNode={c}
                                     compartmentOnly={true}
                                     visibleBrainAreas={this.props.visibleBrainAreas}
                                     onSelect={this.onSelect}/>
            ));
            list = (
                <List>
                    {listItems}
                </List>
            );
        } else {
            list = (
                <List>
                    <CompartmentNodeView compartmentNode={this.props.rootNode}
                                         compartmentOnly={false}
                                         onToggle={this.onToggle}
                                         visibleBrainAreas={this.props.visibleBrainAreas}
                                         onSelect={this.onSelect}/>
                </List>
            );
        }

        return (
            <Container fluid>
                <div>
                    <Input size="mini" icon="search" iconPosition="left" action={{icon: "cancel", as: "div", onClick: () => this.setState({filterText: ""})}}
                           placeholder='Filter compartments...' fluid value={this.state.filterText} className="compartment-search"
                           onChange={(e, {value}) => this.setState({filterText: value.toLowerCase()})}/>
                </div>
                <div style={{padding: "10px"}}>
                    {list}
                </div>
            </Container>
        );
    }
}
