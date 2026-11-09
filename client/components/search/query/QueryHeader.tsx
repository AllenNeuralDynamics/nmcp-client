import * as React from "react";
import {observer} from "mobx-react-lite";
import {Button, Divider, Group, Text} from "@mantine/core";
import {IconPlus, IconRestore, IconSearch, IconShare3} from "@tabler/icons-react";

import {QueryStatus} from "../../../viewmodel/queryResponseViewModel";
import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {useUIQuery} from "../../../hooks/useUIQuery";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {useSearchAtlas} from "../../../hooks/useSearchAtlas";
import {useSearchViewer} from "../../../hooks/useSearchViewer";
import {usePerformQuery} from "../../../hooks/usePerformQuery";
import {CollectionsSelect} from "../../common/CollectionsSelect";
import {shareState, shareUrl} from "../../../util/shareLink";
import {captureShareContent} from "../../../util/shareLinkSync";

// Hidden while the address bar carries the share link.  It returns, presented differently, for result sets too large
// for a browser to copy from the address bar intact (Safari cuts a copied URL at 4,096 characters).
const IsShareButtonVisible = false;

export const QueryHeader = observer(() => {
    const performQuery = usePerformQuery();
    const appLayout = useAppLayout();
    const queryResponse = useQueryResponseViewModel();
    const uiQuery = useUIQuery();
    const searchAtlas = useSearchAtlas();
    const searchViewerRef = useSearchViewer();

    const onResetPage = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.stopPropagation();

        uiQuery.reset();
        queryResponse.reset();

        searchAtlas.atlasViewModel?.clear();

        appLayout.isQueryExpanded = true;
    };

    const onPerformQuery = async (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.stopPropagation();

        await performQuery();
    };

    const onAddFilter = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.stopPropagation();
        uiQuery.addPredicate();
    }

    const onShare = async (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.stopPropagation();

        const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

        // Captured now rather than read from the address bar, which trails a change by the sync delay.
        const content = captureShareContent({uiQuery, queryResponse, appLayout, searchViewerRef});

        const url = content ? shareUrl(baseUrl, shareState(content)) : window.location.href;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(url);
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
                message = "Optionally filter neurons by the criteria below and click Search to view results"
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

    const renderCollections = () => {
        return (
            <CollectionsSelect limitCollections={uiQuery.limitCollections} onChangeSelectAll={(b) => uiQuery.limitCollections = b}
                               values={uiQuery.collectionIds}
                               onChange={(id) => uiQuery.collectionIds = id}/>
        );
    }

    const renderButtons = () => {
        return (
            <Group>
                {renderResetButton()}
                {IsShareButtonVisible ?
                    <Button variant="light" leftSection={<IconShare3 size={18}/>} disabled={queryResponse.status === QueryStatus.Loading} onClick={onShare}>
                        Share
                    </Button> : null}
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
        <Group p="12 0" justify="space-between" preventGrowOverflow={false} onClick={(evt) => evt.stopPropagation()}>
            <Group align="baseline">
                <Text size="lg" fw={500}>Search Published Neurons</Text>
                {renderMessage()}
            </Group>
            <Group justify="space-between" style={{marginLeft: "auto"}}>
                {renderCollections()}
                <Divider orientation="vertical"/>
                {renderButtons()}
            </Group>
        </Group>
    );
});
