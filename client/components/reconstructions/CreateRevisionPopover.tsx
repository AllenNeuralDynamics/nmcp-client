import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Group, Popover, Select, Stack, Text} from "@mantine/core";
import {IconVersions} from "@tabler/icons-react";

import {
    OPEN_RECONSTRUCTION_REVISION_MUTATION,
    OpenReconstructionRevisionResponse,
    OpenReconstructionRevisionVariables,
    RECONSTRUCTIONS_QUERY,
} from "../../graphql/reconstruction";
import {ReconstructionRevisionKind} from "../../models/reconstruction";
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

export const CreateRevisionPopover = ({id}: { id: string }) => {
    const [opened, setOpened] = useState(false);
    const [inProgress, setInProgress] = useState(false);

    const [revisionKind, setRevisionKind] = useState<string | null>(null);

    const [openReconstructionRevision] = useMutation<OpenReconstructionRevisionResponse, OpenReconstructionRevisionVariables>(OPEN_RECONSTRUCTION_REVISION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => console.log(e)
        });

    const open = () => {
        setOpened(true);
        setRevisionKind(null);
    }

    const openRevision = async () => {
        setInProgress(true);
        const response = await openReconstructionRevision({variables: {reconstructionId: id, revisionKind: mapRevisionKind(revisionKind)}});
        if (response?.data) {
            if (!response.data.openReconstructionRevision) {
                errorNotification("Revision not Opened", "The revision could not be opened.  You may have an existing open reconstruction for this neuron.")
            }
        }
        setOpened(false);
        setInProgress(false);
    }

    const revisionText = revisionKind ? (revisionKind == SpecimenSpace ? specimenHint : atlasHint) : null;
    const commonText = revisionKind ? commonHint : null;

    return <Popover opened={opened} onChange={setOpened} trapFocus>
        <Popover.Target>
            <Button variant="light" leftSection={<IconVersions size={18}/>} color={actionColor(action)}
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
