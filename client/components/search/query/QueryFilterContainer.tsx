import * as React from "react";
import {observer} from "mobx-react-lite";
import {Accordion, Stack} from "@mantine/core";

import {useConstants} from "../../../hooks/useConstants";
import {useUIQuery} from "../../../hooks/useUIQuery";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {QueryFilter} from "./QueryFilter";
import {QueryHeader} from "./QueryHeader";


export const QueryFilterContainer = observer(() => {
    const constants = useConstants();
    const appLayout = useAppLayout();
    const uiPredicates = useUIQuery();

    const predicates = uiPredicates.predicates;

    const renderPredicates = () => predicates.map((q, index) => (
            <QueryFilter queryFilter={q} key={index}
                         isSolo={predicates.length == 1}
                         isComposite={index > 0}
                         isRemovable={predicates.length > 1}
                         queryOperators={constants.QueryOperators}
                         onChangeFilter={(f) => uiPredicates.replacePredicate(f)}
                         onRemoveFilter={(id: string) => uiPredicates.removePredicate(id)}/>));

    return (
        <Accordion multiple={false} transitionDuration={0} chevronPosition="left" chevronIconSize={22} value={appLayout.isQueryExpanded ? "query" : null}
                   onChange={v => appLayout.isQueryExpanded = v != null}>
            <Accordion.Item value="query">
                <Accordion.Control bg="section" styles={{label: {padding: 0}}}>
                    <QueryHeader/>
                </Accordion.Control>
                <Accordion.Panel styles={{content: {padding: 0}}}>
                    <Stack p={12} mah={240} style={{overflow: "auto"}}>
                        {appLayout.isQueryExpanded ? renderPredicates() : null}
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
});
