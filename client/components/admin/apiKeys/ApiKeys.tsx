import React, {useState} from "react";
import {useQuery} from "@apollo/client";
import {Button, Card, Center, Divider, Group, Table, Text} from "@mantine/core";
import {IconKey, IconTrash} from "@tabler/icons-react";
import dayjs from "dayjs";

import {API_KEYS_QUERY, ApiKeyShape, ApiKeysResponse} from "../../../graphql/apiKey";
import {GraphQLErrorAlert} from "../../common/GraphQLErrorAlert";
import {AppLoading} from "../../app/AppLoading";
import {CreateApiKeyModal} from "./CreateApiKeyModal";
import {RevokeApiKeyModal} from "./RevokeApiKeyModal";

export const ApiKeys = () => {
    const [showCreate, setShowCreate] = useState(false);
    const [revokeTarget, setRevokeTarget] = useState<ApiKeyShape>(null);

    const {data, previousData, loading, error} = useQuery<ApiKeysResponse>(API_KEYS_QUERY, {
        pollInterval: 30000
    });

    if (error) {
        return <GraphQLErrorAlert title="API Keys Could not be Loaded" error={error}/>;
    }

    if (loading && !previousData) {
        return <AppLoading message={"loading api keys..."}/>;
    }

    const apiKeys: ApiKeyShape[] = (loading ? previousData?.apiKeys : data?.apiKeys) ?? [];

    if (apiKeys.length === 0) {
        return (
            <>
                <Card withBorder>
                    <Card.Section bg="segment">
                        <Group p={12} justify="space-between">
                            <Text size="lg" fw={500}>API Keys</Text>
                            <Button size="xs" leftSection={<IconKey size={16}/>}
                                    onClick={() => setShowCreate(true)}>Create</Button>
                        </Group>
                        <Divider orientation="horizontal"/>
                    </Card.Section>
                    <Card.Section>
                        <Center p={12}>
                            <Text size="lg" fw={500} c="dimmed">No API keys</Text>
                        </Center>
                    </Card.Section>
                </Card>
                <CreateApiKeyModal show={showCreate} onClose={() => setShowCreate(false)}/>
            </>
        );
    }

    const rows = apiKeys.map(k => (
        <Table.Tr key={k.id}>
            <Table.Td><Text size="sm" style={{whiteSpace: "nowrap"}}>{dayjs(k.createdAt).format("YYYY-MM-DD")}</Text></Table.Td>
            <Table.Td>{k.description}</Table.Td>
            <Table.Td><Text size="sm" style={{whiteSpace: "nowrap"}}>{k.expiration ? dayjs(k.expiration).format("YYYY-MM-DD") : ""}</Text></Table.Td>
            <Table.Td>
                <Button variant="light" color="red" size="xs" leftSection={<IconTrash size={16}/>}
                        onClick={() => setRevokeTarget(k)}>Revoke</Button>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Card withBorder>
                <Card.Section bg="segment">
                    <Group p={12} justify="space-between">
                        <Text size="lg" fw={500}>API Keys</Text>
                        <Button size="xs" leftSection={<IconKey size={16}/>}
                                onClick={() => setShowCreate(true)}>Create</Button>
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section>
                    <Table withColumnBorders>
                        <Table.Thead bg="table-header">
                            <Table.Tr>
                                <Table.Th>Created</Table.Th>
                                <Table.Th>Description</Table.Th>
                                <Table.Th>Expires</Table.Th>
                                <Table.Th w={100}/>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows}
                        </Table.Tbody>
                    </Table>
                </Card.Section>
            </Card>
            <CreateApiKeyModal show={showCreate} onClose={() => setShowCreate(false)}/>
            {revokeTarget && <RevokeApiKeyModal show={!!revokeTarget} apiKey={revokeTarget}
                                                onClose={() => setRevokeTarget(null)}/>}
        </>
    );
};
