import React from "react";
import {useContext} from "react";

import {UserContext} from "../app/UserApp";
import {UserPermissions} from "../../graphql/user";
import {FullReview} from "./FullReview";
import {PeerReview} from "./PeerReview";
import {Anchor, Divider, Group} from "@mantine/core";
import {IconEye, IconEyeOff} from "@tabler/icons-react";

export const Review = () => {
    const [peerVisible, setPeerVisible] = React.useState(true);
    const [fullVisible, setFullVisible] = React.useState(true);

    const user = useContext(UserContext);

    const havePeer = user?.permissions & UserPermissions.PeerReview
    const haveFull = user?.permissions & UserPermissions.FullReview;

    const peer = havePeer && peerVisible ? <PeerReview/> : null;

    const full = haveFull && fullVisible ? <FullReview/> : null;

    const peerIcon = peerVisible ? <IconEyeOff size={16}/> : <IconEye size={16}/>;
    const fullIcon = fullVisible ? <IconEyeOff size={16}/> : <IconEye size={16}/>;

    const divider = havePeer && haveFull ? <Divider my="md" label={
        <Group gap="xl">
            <Anchor onClick={e => setPeerVisible(!peerVisible)}>
                <Group gap="xs" justify="flex-start">
                    {peerIcon}
                    {peerVisible ? "Hide" : "Show"} Peer Review
                </Group>
            </Anchor>
            <Divider orientation="vertical" />
            <Anchor onClick={e => setFullVisible(!fullVisible)}>
                <Group gap="xs" justify="flex-end">
                    {fullIcon}
                    {fullVisible ? "Hide" : "Show"} Full Review
                </Group>
            </Anchor>
        </Group>
    }/> : null;

    return (
        <div>
            {peer}
            {divider}
            {full}
        </div>
    );
};
