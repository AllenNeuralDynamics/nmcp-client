import * as React from "react";
import {observer} from "mobx-react";
import {Container, Input, List} from "semantic-ui-react";

import {StructureTreeNode} from "./StructureTreeNode";
import {useAtlas} from "../../../../hooks/useAtlas";

export const AtlasTree = observer(() => {
    const atlas = useAtlas();

    const [filterText, setFilterText] = React.useState<string>("");

    const listItems = () => {
        if (filterText) {
            const items = atlas.structures.filter(c => c.matches(filterText));

            const listItems = items.map(c => (<StructureTreeNode key={c.structure.id} structure={c} structureOnly={true}/>));
            return (
                <List>
                    {listItems}
                </List>
            );
        } else {
            const root = atlas.rootStructure;

            return (
                <List>
                    <StructureTreeNode key={root.structure.id} structure={root} structureOnly={false}/>
                </List>
            );
        }
    };

    return (
        <Container fluid>
            <div>
                <Input size="mini" icon="search" iconPosition="left" action={{icon: "cancel", as: "div", onClick: () => setFilterText("")}}
                       placeholder='Filter compartments...' fluid value={filterText} className="compartment-search"
                       onChange={(_, {value}) => setFilterText(value.toLowerCase())}/>
            </div>
            <div style={{padding: "10px"}}>
                {listItems()}
            </div>
        </Container>
    );
});
