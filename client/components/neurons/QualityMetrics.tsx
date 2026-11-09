import * as React from "react";
import {useQuery} from "@apollo/client";
import {Badge, Flex, Group, Loader, Stack, Text} from "@mantine/core";

import {atlasQualityControlColor, atlasQualityControlStatus} from "../../models/atlasQualityControlStatus";
import {
    ATLAS_QUALITY_CONTROL_DETAIL_QUERY,
    AtlasQualityControlDetailResponse,
    AtlasQualityControlDetailVariables,
} from "../../graphql/atlasQualityControl";
import {QualityControlOutputSection} from "../common/QualityControlOutputSection";

type QualityMetricsProps = {
    qualityControlId?: string;
}

export const QualityMetrics = ({qualityControlId}: QualityMetricsProps) => {
    const {data, loading} = useQuery<AtlasQualityControlDetailResponse, AtlasQualityControlDetailVariables>(ATLAS_QUALITY_CONTROL_DETAIL_QUERY, {
        variables: {id: qualityControlId},
        skip: !qualityControlId
    });

    const qc = data?.atlasQualityControl;

    if (loading) {
        return (
            <Flex p={24} justify="center">
                <Loader size="sm"/>
            </Flex>
        );
    }

    if (!qc) {
        return (
            <Flex p={24}>
                <Text size="sm" c="dimmed">Quality control has not been created for this neuron.</Text>
            </Flex>
        );
    }

    const badge = (
        <Badge color={atlasQualityControlColor(qc.status)} variant="light" size="lg">
            {atlasQualityControlStatus(qc.status)}
        </Badge>
    );

    return (
        <Stack p={12} gap="md">
            {qc.current ? <QualityControlOutputSection output={qc.current} leading={badge}/> : <Group gap="xs">{badge}</Group>}
            {qc.history?.length > 0 ? (
                <Text size="sm" c="dimmed">{qc.history.length} prior {qc.history.length === 1 ? "result" : "results"} available</Text>
            ) : null}
        </Stack>
    );
};
