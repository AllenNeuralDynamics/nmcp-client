import * as React from "react";
import {useQuery} from "@apollo/client";
import {Badge, Flex, Loader, Stack, Text} from "@mantine/core";

import {qualityControlColor, qualityControlStatus} from "../../models/qualityControlStatus";
import {
    QUALITY_CONTROL_DETAIL_QUERY,
    QualityControlDetailResponse,
    QualityControlDetailVariables,
} from "../../graphql/qualityControl";
import {QualityControlOutputSection} from "../common/QualityControlOutputSection";

type QualityMetricsProps = {
    qualityControlId?: string;
}

export const QualityMetrics = ({qualityControlId}: QualityMetricsProps) => {
    const {data, loading} = useQuery<QualityControlDetailResponse, QualityControlDetailVariables>(QUALITY_CONTROL_DETAIL_QUERY, {
        variables: {id: qualityControlId},
        skip: !qualityControlId
    });

    const qc = data?.qualityControl;

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

    return (
        <Stack p={12} gap="md">
            <Badge color={qualityControlColor(qc.status)} variant="light" size="lg">
                {qualityControlStatus(qc.status)}
            </Badge>
            {qc.current ? <QualityControlOutputSection output={qc.current}/> : null}
            {qc.history?.length > 0 ? (
                <Text size="sm" c="dimmed">{qc.history.length} prior {qc.history.length === 1 ? "result" : "results"} available</Text>
            ) : null}
        </Stack>
    );
};
