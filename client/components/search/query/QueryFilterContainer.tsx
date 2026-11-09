import * as React from "react";
import {observer} from "mobx-react-lite";
import {Accordion, Stack} from "@mantine/core";

import {useConstants} from "../../../hooks/useConstants";
import {useUIQuery} from "../../../hooks/useUIQuery";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {QueryFilter} from "./QueryFilter";
import {QueryHeader} from "./QueryHeader";
import {usePerformQuery} from "../../../hooks/usePerformQuery";
import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {QueryStatus} from "../../../viewmodel/queryResponseViewModel";
import {isSearchEnterKey} from "./searchEnterKey";

export const QueryFilterContainer = observer(() => {
    const constants = useConstants();
    const appLayout = useAppLayout();
    const uiPredicates = useUIQuery();
    const queryResponse = useQueryResponseViewModel();
    const performQuery = usePerformQuery();

    const predicates = uiPredicates.predicates;

    // The Search button is disabled while a search is loading; Enter honors the same.
    const onKeyDown = (event: React.KeyboardEvent) => {
        if (isSearchEnterKey(event) && queryResponse.status !== QueryStatus.Loading) {
            event.preventDefault();
            performQuery();
        }
    };

    const renderPredicates = () => predicates.map((q, index) => (
            <QueryFilter queryFilter={q} key={index}
                         isSolo={predicates.length == 1}
                         isComposite={index > 0}
                         isRemovable={predicates.length > 1}
                         queryOperators={constants.QueryOperators}
                         onChangeFilter={(f) => uiPredicates.replacePredicate(f)}
                         onRemoveFilter={(id: string) => uiPredicates.removePredicate(id)}/>));

    return (
        <Accordion multiple={false} chevronPosition="left" chevronIconSize={22} value={appLayout.isQueryExpanded ? "query" : null}
                   onChange={v => appLayout.isQueryExpanded = v != null} onKeyDown={onKeyDown}>
            <Accordion.Item value="query">
                <Accordion.Control bg="section" styles={{label: {padding: 0}}}>
                    <QueryHeader/>
                </Accordion.Control>
                <Accordion.Panel styles={{content: {padding: 0}}}>
                    <Stack p={12} mah={240} style={{overflow: "auto"}}>
                        {renderPredicates()}
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
});
