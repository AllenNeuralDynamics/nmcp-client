import * as React from "react";
import {useState} from "react";
import {Button, Group} from "@mantine/core";
import {IconBook} from "@tabler/icons-react";

import {Reconstruction} from "../../../models/reconstruction";
import {PublishAllModal} from "./PublishAllModal";

export const PublishedActions = ({reconstructions, totalCount}: { reconstructions: Reconstruction[], totalCount: number }) => {
    const [isPublishAllOpen, setIsPublishAllOpen] = useState(false);

    return (
        <Group p={12} justify="end">
            <PublishAllModal open={isPublishAllOpen} reconstructions={reconstructions} totalCount={totalCount} onClose={() => setIsPublishAllOpen(false)}/>
            <Button variant="light" color="green" leftSection={<IconBook size={18}/>} onClick={()=>setIsPublishAllOpen(true)}>Publish All...</Button>
        </Group>
    )
}
