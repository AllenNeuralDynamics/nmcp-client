import * as React from "react";
import {useApolloClient} from "@apollo/client";
import {Button, Divider, Group, Text} from "@mantine/core";
import {IconPlus, IconRestore, IconSearch, IconShare3} from "@tabler/icons-react";

import {QueryStatus} from "../../../viewmodel/queryResponseViewModel";
import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {observer} from "mobx-react-lite";
import {useUIQuery} from "../../../hooks/useUIQuery";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {useAtlas} from "../../../hooks/useAtlas";
import {usePreferences} from "../../../hooks/usePreferences";
import {NeuroglancerProxy} from "../../../viewer/neuroglancerProxy";

export const QueryHeader = observer(() => {
    const client = useApolloClient();
    const preferences = usePreferences();
    const appLayout = useAppLayout();
    const queryResponse = useQueryResponseViewModel();
    const uiQuery = useUIQuery();
    const atlas = useAtlas();

    const onResetPage = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.stopPropagation();

        uiQuery.reset();
        queryResponse.reset();

        atlas.clear();

        appLayout.isQueryExpanded = true;
    };

    const onPerformQuery = async (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.stopPropagation();

        if (!appLayout.isQueryExpanded && !preferences.ShouldAutoCollapseOnQuery) {
            appLayout.isQueryExpanded = true;
        }
        await uiQuery.execute(queryResponse, client);
    };

    const onAddFilter = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.stopPropagation();
        uiQuery.addPredicate();
    }

    const onShare = async (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.stopPropagation();
        const queryData = {
            timestamp: Date.now(),
            filters: uiQuery.predicates.map(p => p.serialize())
        };

        const encodedQuery = btoa(JSON.stringify(queryData));
        const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        let shareUrl = `${baseUrl}?q=${encodedQuery}`;

        const ngState = NeuroglancerProxy.SearchNeuroglancer?.State;

        if (ngState) {
            shareUrl += `#!${btoa(JSON.stringify(ngState))}`;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(shareUrl);
            } catch (err) {
                console.error("Failed to copy URL to clipboard:", err);
            }
        } else {
            console.warn("Clipboard not supported in this browser.");
        }
    };

    const renderResetButton = () => {
        return (
            <Button variant="light" color="orange" leftSection={<IconRestore size={18}/>} disabled={queryResponse.status === QueryStatus.Loading}
                    onClick={onResetPage}>Reset</Button>
        )
    }

    const renderMessage = () => {
        let message: string = null;

        if (queryResponse.status === QueryStatus.NeverQueried) {
            if (!appLayout.isQueryExpanded) {
                message = "Expand to filter your neuron search";
            } else {
                message = "Optionally filter neurons by the criteria below"
            }
        } else if (queryResponse.status === QueryStatus.Loading) {
            message = "Search in progress...";
        } else {
            if (queryResponse.matchCount > 0) {
                const duration = (queryResponse.queryTime / 1000);

                let matched = `Matched ${queryResponse.matchCount} of ${queryResponse.totalCount} neurons`;

                matched += ` in ${duration.toFixed(3)} ${duration === 1 ? "second" : "seconds"}`;
                message = matched;
            } else {
                message = "There were no neurons that met the specified criteria."
            }
        }

        return message ? <Text size="xs" c="dimmed">{message}</Text> : null;
    }

    const renderButtons = () => {
        return (
            <Group>
                {renderResetButton()}
                {/*
                <Button variant="light" leftSection={<IconShare3 size={18}/>} disabled={queryResponse.status === QueryStatus.Loading} onClick={onShare}>
                    Share
                </Button>*/}
                <Divider orientation="vertical"/>
                <Button variant="light" leftSection={<IconPlus size={18}/>} disabled={queryResponse.status === QueryStatus.Loading} onClick={onAddFilter}>
                    Add Filter
                </Button>
                <Button variant="light" color="green" leftSection={<IconSearch size={18}/>} loading={queryResponse.status === QueryStatus.Loading}
                        onClick={onPerformQuery}>
                    Search
                </Button>
            </Group>
        );
    }

    return (
        <Group p="12 0" justify="space-between" onClick={(evt) => evt.stopPropagation()}>
            <Group align="baseline">
                <Text size="lg" fw={500}>Search Published Neurons</Text>
                {renderMessage()}
            </Group>
            {renderButtons()}
        </Group>
    );
});
