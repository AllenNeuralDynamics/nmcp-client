import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Group, MantineSize, Popover, Select, Stack, Text} from "@mantine/core";
import {IconVersions} from "@tabler/icons-react";

import {
    OPEN_ANNOTATION_REVISION_MUTATION,
    OpenAnnotationRevisionResponse,
    OpenAnnotationRevisionVariables,
    ANNOTATIONS_QUERY,
} from "../../graphql/annotation";
import {Annotation, ReconstructionRevisionKind} from "../../models/annotation";
import {actionColor, actionName, ReconstructionAction} from "../../models/reconstructionAction";
import {errorNotification} from "../common/NotificationHelper";

const action = ReconstructionAction.CreateRevision;

const SpecimenSpace = "Specimen-Space";
const AtlasSpace = "Atlas-Space";

const specimenHint = "The specimen-space revision will create a new reconstruction for this neuron that is fully independent from the current published reconstruction."

const atlasHint = "The atlas-space revision will copy the specimen-space reconstruction data from the current published reconstruction."

const commonHint = "After review, the reconstruction may be published to replace the current one."

function mapRevisionKind(value: string): ReconstructionRevisionKind {
    return value == SpecimenSpace ? ReconstructionRevisionKind.SpecimenSpace : ReconstructionRevisionKind.AtlasSpace;
}

export type CreateRevisionPopoverProps = {
    id: string;
    size?: MantineSize;

    onCreated?(revision: Annotation): void;
}

export const CreateRevisionPopover = ({id, size = "sm", onCreated}: CreateRevisionPopoverProps) => {
    const [opened, setOpened] = useState(false);
    const [inProgress, setInProgress] = useState(false);

    const [revisionKind, setRevisionKind] = useState<string | null>(null);

    const [openAnnotationRevision] = useMutation<OpenAnnotationRevisionResponse, OpenAnnotationRevisionVariables>(OPEN_ANNOTATION_REVISION_MUTATION,
        {
            refetchQueries: [ANNOTATIONS_QUERY],
            onError: (e) => errorNotification("Error Creating Revision", e.message)
        });

    const open = () => {
        setOpened(true);
        setRevisionKind(null);
    }

    const openRevision = async () => {
        setInProgress(true);
        const response = await openAnnotationRevision({variables: {annotationId: id, revisionKind: mapRevisionKind(revisionKind)}});
        setOpened(false);
        setInProgress(false);

        const revision = response?.data?.openAnnotationRevision;

        if (revision) {
            onCreated?.(revision);
        } else if (response?.data) {
            errorNotification("Revision not Opened", "The revision could not be opened.  You may have an existing open reconstruction for this neuron.")
        }
    }

    const revisionText = revisionKind ? (revisionKind == SpecimenSpace ? specimenHint : atlasHint) : null;
    const commonText = revisionKind ? commonHint : null;

    return <Popover opened={opened} onChange={setOpened} trapFocus>
        <Popover.Target>
            <Button variant="light" size={size} leftSection={<IconVersions size={size == "xs" ? 14 : 18}/>} color={actionColor(action)}
                    onClick={() => open()}>{actionName(action)}</Button>
        </Popover.Target>
        <Popover.Dropdown>
            <Stack w={400}>
                <Text>Revise a Published Reconstruction</Text>
                <Select label="Type of revision" placeholder="Select revision type" comboboxProps={{withinPortal: false}}
                        data={[SpecimenSpace, AtlasSpace]} value={revisionKind} onChange={setRevisionKind}/>
                <Text size="sm" c="dimmed">{revisionText}</Text>
                <Text size="sm" c="dimmed">{commonText}</Text>
                <Group justify="end">
                    <Button variant="light" loading={inProgress} disabled={revisionText == null || inProgress} onClick={openRevision}>Create</Button>
                </Group>
            </Stack>
        </Popover.Dropdown>
    </Popover>
}
