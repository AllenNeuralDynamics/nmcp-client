import * as React from "react";
import {useMutation, useQuery} from "@apollo/client";
import {Badge, Button, Flex, Group, Loader, Stack, Text} from "@mantine/core";
import {IconRefresh} from "@tabler/icons-react";

import {Annotation} from "../../../models/annotation";
import {qualityControlReassessmentGate} from "../../../models/reconstructionGates";
import {atlasQualityControlColor, atlasQualityControlStatus} from "../../../models/atlasQualityControlStatus";
import {
    ATLAS_QUALITY_CONTROL_DETAIL_QUERY,
    AtlasQualityControlDetailResponse,
    AtlasQualityControlDetailVariables,
    REASSESS_QUALITY_CONTROL_MUTATION,
    ReassessQualityControlResponse,
    ReassessQualityControlVariables
} from "../../../graphql/atlasQualityControl";
import {ANNOTATIONS_QUERY} from "../../../graphql/annotation";
import {QualityControlOutputSection} from "../../common/QualityControlOutputSection";
import {useUser} from "../../../hooks/useUser";

export type QualityCheckProps = {
    reconstruction: Annotation;
    isActive: boolean;
}

export const QualityCheck = ({reconstruction, isActive}: QualityCheckProps) => {
    const user = useUser();

    const qcId = reconstruction.atlasReconstruction?.qualityControl?.id;

    const {data, loading, refetch} = useQuery<AtlasQualityControlDetailResponse, AtlasQualityControlDetailVariables>(ATLAS_QUALITY_CONTROL_DETAIL_QUERY, {
        variables: {id: qcId},
        skip: !isActive || !qcId
    });

    const [reassess, {loading: reassessing}] = useMutation<ReassessQualityControlResponse, ReassessQualityControlVariables>(REASSESS_QUALITY_CONTROL_MUTATION, {
        variables: {annotationId: reconstruction.id},
        refetchQueries: [ANNOTATIONS_QUERY],
        onCompleted: () => refetch()
    });

    if (!qcId) {
        return (
            <Flex p={24}>
                <Text size="sm" c="dimmed">Quality control has not been created for this reconstruction.</Text>
            </Flex>
        );
    }

    const qc = data?.atlasQualityControl;
    const qcStatus = qc?.status;

    const reassessGate = qualityControlReassessmentGate({
        area: "review",
        status: reconstruction.status,
        childStatus: reconstruction.atlasReconstruction?.status,
        permissions: user?.permissions ?? 0,
        annotatorId: reconstruction.annotatorId,
        userId: user?.id
    });

    const leading = (
        <>
            <Badge color={atlasQualityControlColor(qcStatus)} variant="light" size="md">
                {atlasQualityControlStatus(qcStatus)}
            </Badge>
            {loading ? <Loader size="xs"/> : null}
        </>
    );

    const trailing = reassessGate.visible ? (
        <Button size="xs" leftSection={<IconRefresh size={16}/>} disabled={!reassessGate.enabled || reassessing}
                loading={reassessing} onClick={() => reassess()}>
            Assess Again
        </Button>
    ) : null;

    return (
        <Stack p={12} gap="md">
            {qc?.current ? <QualityControlOutputSection output={qc.current} leading={leading} trailing={trailing}/> : (
                <Group justify="space-between">
                    <Group gap="xs">{leading}</Group>
                    {trailing}
                </Group>
            )}
            {qc?.history?.length > 0 ? (
                <Text size="sm" c="dimmed">{qc.history.length} prior {qc.history.length === 1 ? "result" : "results"} available</Text>
            ) : null}
        </Stack>
    );
}
