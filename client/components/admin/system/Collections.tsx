import React, {useState} from "react";
import {useQuery} from "@apollo/client";
import {Navigate} from "react-router-dom";
import {Badge, Button, Card, Divider, Group, Space, Table, Text} from "@mantine/core";
import {IconPlus} from "@tabler/icons-react";

import {COLLECTIONS_QUERY, CollectionsResponse} from "../../../graphql/collection";
import {CollectionShape} from "../../../models/collection";
import {EditCollection} from "./EditCollection";
import {GraphQLErrorAlert} from "../../common/GraphQLErrorAlert";
import {useUser} from "../../../hooks/useUser";
import {UserPermissions} from "../../../graphql/user";
import {AppLoading} from "../../app/AppLoading";

export const Collections = () => {
    const user = useUser();

    const [selectedId, setSelectedId] = useState<string>(null);

    if ((user?.permissions & UserPermissions.Admin) == 0) {
        return <Navigate to="/" replace/>;
    }

    const {loading, error, data, previousData} = useQuery<CollectionsResponse>(COLLECTIONS_QUERY, {
        pollInterval: 60000
    });

    if (error) {
        return <GraphQLErrorAlert title="Collections Could not be Loaded" error={error}/>;
    }

    if (loading && !previousData) {
        return <AppLoading message={"loading collections..."}/>;
    }

    let source = loading ? previousData : data;

    const collections: CollectionShape[] = source.collections ?? [];

    const selected = collections.find((c: CollectionShape) => c.id === selectedId);

    const onRowClick = (collection: CollectionShape) => {
        setSelectedId(collection.id);
    };

    const rows = data.collections.map((c: CollectionShape) => {
        return <CollectionRow collection={c} isSelected={c.id == selectedId} onClick={onRowClick}/>
    });

    return (
        <div>
            <Card withBorder>
                <Card.Section bg="segment">
                    <Group p={12} justify="space-between">
                        <Text size="lg" fw={500}>Collections</Text>
                        <Button leftSection={<IconPlus size={18}/>}>Add</Button>
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="segment">
                    <Table>
                        <Table.Thead bg="table-header">
                            <Table.Tr>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Description</Table.Th>
                                <Table.Th>Reference</Table.Th>
                                <Table.Th>Specimens</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody bg="table">
                            {rows}
                        </Table.Tbody>
                    </Table>
                </Card.Section>
                <Card.Section bg="segment">
                    <Text m={8} size="sm">
                        {`Showing all collections`}
                    </Text>
                </Card.Section>
            </Card>
            <Space h={24}/>
            {selected ? <EditCollection collection={selected}/> : null}
        </div>
    );
}

type  CollectionRowProps = {
    collection: CollectionShape;
    isSelected: boolean;

    onClick(collection: CollectionShape): void;
}

const CollectionRow = (props: CollectionRowProps) => {
    const subProps = props.isSelected ? {bg: "table-selection"} : {};

    return (
        <Table.Tr key={`collection_${props.collection.id}`} {...subProps} onClick={() => props.onClick(props.collection)}>
            <Table.Td><Text size="sm" style={{whiteSpace: 'nowrap'}}>{props.collection.name}</Text></Table.Td>
            <Table.Td>{props.collection.description}</Table.Td>
            <Table.Td>{props.collection.reference}</Table.Td>
            <Table.Td>
                <Badge variant="light" color={props.collection.specimenCount == 0 ? "indigo" : "green"}>
                    {props.collection.specimenCount}
                </Badge>
            </Table.Td>
        </Table.Tr>
    );
}
