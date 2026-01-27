import * as React from "react";
import {observer} from "mobx-react-lite";

import {StructureListItem} from "./StructureListItem";
import {List, Stack, TextInput} from "@mantine/core";
import {useState} from "react";
import {IconSearch, IconX} from "@tabler/icons-react";
import {StructureTree} from "./StructureTreeNode";
import {AtlasViewModel} from "../../../../viewmodel/atlasViewModel";

export const AtlasTree = observer(({atlas}: {atlas: AtlasViewModel}) => {
    const [filterText, setFilterText] = useState<string>("");

    const listItems = () => {
        if (filterText) {
            const items = atlas.structures.filter(c => c.matches(filterText));

            const listItems = items.map(c => (<StructureListItem key={c.structure.id} atlas={atlas} structure={c}/>));
            return (
                <List>
                    {listItems}
                </List>
            );
        } else {
            return <StructureTree atlas={atlas}/>;
        }
    };

    return (
        <Stack gap={0}>
            <TextInput radius={0} bd="0px" value={filterText} placeholder="Filter structures..." leftSection={<IconSearch size={18}/>} rightSection={<IconX size={18} onClick={() => setFilterText("")}/>}
                       onChange={v => setFilterText(v.currentTarget.value?.toLowerCase() ?? "")}/>
            {listItems()}
        </Stack>
    );
});
