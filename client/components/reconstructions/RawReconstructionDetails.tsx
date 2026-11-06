import * as React from "react";
import {Badge, Group, Stack, Table, Text} from "@mantine/core";
import dayjs from "dayjs";

import {Annotation} from "../../models/annotation";
import {RawReconstructionUploadStatus, rawUploadStatusColor, rawUploadStatusName} from "../../models/rawReconstructionUpload";
import {formatUser} from "../../models/user";

const headerWidth = 130;

function formatTime(value: Date): string {
    return value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "";
}

function Row({label, children}: { label: string, children: React.ReactNode }) {
    return (
        <Table.Tr>
            <Table.Th bg="table-header" w={headerWidth}>{label}</Table.Th>
            <Table.Td>{children}</Table.Td>
        </Table.Tr>
    );
}

function RawReconstructionSection({reconstruction}: { reconstruction: Annotation }) {
    const raw = reconstruction.rawReconstruction;

    return (
        <Stack gap="xs">
            <Text size="sm" fw={500}>Raw Reconstruction</Text>
            {raw ?
                <Table variant="vertical" layout="fixed" withTableBorder withColumnBorders>
                    <Table.Tbody>
                        <Row label="Uploaded">{formatTime(raw.uploadedAt)}</Row>
                        <Row label="Axon Nodes">{raw.nodeCounts?.axon?.total ?? ""}</Row>
                        <Row label="Dendrite Nodes">{raw.nodeCounts?.dendrite?.total ?? ""}</Row>
                        {raw.notes ? <Row label="Notes">{raw.notes}</Row> : null}
                    </Table.Tbody>
                </Table> :
                <Text size="sm" c="dimmed">No raw reconstruction has been uploaded.</Text>}
        </Stack>
    );
}

function LatestUploadSection({reconstruction}: { reconstruction: Annotation }) {
    const attempt = reconstruction.latestRawReconstructionUpload;

    const failed = attempt?.status == RawReconstructionUploadStatus.FailedUpload || attempt?.status == RawReconstructionUploadStatus.FailedQualityControl;

    return (
        <Stack gap="xs">
            <Group justify="space-between">
                <Text size="sm" fw={500}>Latest Upload Attempt</Text>
                {attempt ? <Badge variant="light" color={rawUploadStatusColor(attempt.status)}>{rawUploadStatusName(attempt.status)}</Badge> : null}
            </Group>
            {attempt ?
                <Table variant="vertical" layout="fixed" withTableBorder withColumnBorders>
                    <Table.Tbody>
                        <Row label="Attempt">{attempt.attemptNumber}</Row>
                        <Row label="File">{attempt.sourceFilename}</Row>
                        <Row label="Uploaded By">{formatUser(attempt.user)}</Row>
                        <Row label="Started">{formatTime(attempt.createdAt)}</Row>
                        {attempt.status != RawReconstructionUploadStatus.Uploading ? <Row label="Finished">{formatTime(attempt.updatedAt)}</Row> : null}
                        {failed && attempt.failureMessage ? <Row label="Reason"><Text size="sm" c="red">{attempt.failureMessage}</Text></Row> : null}
                    </Table.Tbody>
                </Table> :
                <Text size="sm" c="dimmed">No raw reconstruction uploads have been attempted.</Text>}
        </Stack>
    );
}

export const RawReconstructionDetails = ({reconstruction}: { reconstruction: Annotation }) => {
    return (
        <Stack p={12} gap="md">
            <RawReconstructionSection reconstruction={reconstruction}/>
            <LatestUploadSection reconstruction={reconstruction}/>
        </Stack>
    );
}
