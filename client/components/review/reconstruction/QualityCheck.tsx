import * as React from "react";
import {useMutation, useQuery} from "@apollo/client";
import {Badge, Button, Flex, Group, Loader, Stack, Text} from "@mantine/core";
import {IconRefresh} from "@tabler/icons-react";

import {Reconstruction} from "../../../models/reconstruction";
import {ReconstructionStatus} from "../../../models/reconstructionStatus";
import {qualityControlColor, QualityControlStatus, qualityControlStatus} from "../../../models/qualityControlStatus";
import {
    QUALITY_CONTROL_DETAIL_QUERY,
    QualityControlDetailResponse,
    QualityControlDetailVariables,
    REASSESS_QUALITY_CONTROL_MUTATION,
    ReassessQualityControlResponse,
    ReassessQualityControlVariables
} from "../../../graphql/qualityControl";
import {QualityControlOutputSection} from "../../common/QualityControlOutputSection";

export type QualityCheckProps = {
    reconstruction: Reconstruction;
    isActive: boolean;
}

export const QualityCheck = ({reconstruction, isActive}: QualityCheckProps) => {
    const qcId = reconstruction.atlasReconstruction?.qualityControl?.id;

    const {data, loading, refetch} = useQuery<QualityControlDetailResponse, QualityControlDetailVariables>(QUALITY_CONTROL_DETAIL_QUERY, {
        variables: {id: qcId},
        skip: !isActive || !qcId
    });

    const [reassess, {loading: reassessing}] = useMutation<ReassessQualityControlResponse, ReassessQualityControlVariables>(REASSESS_QUALITY_CONTROL_MUTATION, {
        variables: {reconstructionId: reconstruction.id},
        refetchQueries: ["ReviewableReconstructions"],
        onCompleted: () => refetch()
    });

    if (!qcId) {
        return (
            <Flex p={24}>
                <Text size="sm" c="dimmed">Quality control has not been created for this reconstruction.</Text>
            </Flex>
        );
    }

    const qc = data?.qualityControl;
    const qcStatus = qc?.status;

    const isPending = qcStatus === QualityControlStatus.Pending;
    const isTerminal = reconstruction.status === ReconstructionStatus.Published || reconstruction.status === ReconstructionStatus.Archived;

    return (
        <Stack p={12} gap="md">
            <Group justify="space-between">
                <Group>
                    <Badge color={qualityControlColor(qcStatus)} variant="light" size="md">
                        {qualityControlStatus(qcStatus)}
                    </Badge>
                    {loading ? <Loader size="xs"/> : null}
                </Group>
                <Button size="xs" leftSection={<IconRefresh size={16}/>} disabled={isPending || reassessing || isTerminal}
                        loading={reassessing} onClick={() => reassess()}>
                    Assess Again
                </Button>
            </Group>
            {qc?.current ? <QualityControlOutputSection output={qc.current}/> : null}
            {qc?.history?.length > 0 ? (
                <Text size="sm" c="dimmed">{qc.history.length} prior {qc.history.length === 1 ? "result" : "results"} available</Text>
            ) : null}
        </Stack>
    );
}
