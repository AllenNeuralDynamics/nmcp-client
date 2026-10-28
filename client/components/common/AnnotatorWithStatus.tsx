import * as React from "react";
import {Group, Text} from "@mantine/core";

import {formatUser} from "../../models/user";
import {Annotation} from "../../models/annotation";
import {ReconstructionStatusLabel} from "./ReconstructionStatus";
import {AnnotationStatus} from "../../models/annotationStatus";

const NoAnnotator = <Text size="sm" c="dimmed">None</Text>;

export const AnnotatorWithStatus = ({reconstructions}: { reconstructions: Annotation | Annotation[] }) => {
    let name: string;
    let status: AnnotationStatus | AnnotationStatus[];

    if (Array.isArray(reconstructions)) {
        const visible = reconstructions.filter(a => a);

        if (visible.length == 0) {
            return NoAnnotator;
        }

        if (visible.length > 1) {
            name = `${visible.length} reconstructions`;
            status = reconstructions.map(r => r.status);
        } else {
            name = formatUser(visible[0].annotator);
            status = visible[0].status;
        }
    } else {
        if (!reconstructions) {
            return NoAnnotator;
        }
        name = formatUser(reconstructions.annotator);
        status  = reconstructions.status;
    }

    return (
        <Group gap="sm" justify="space-between">
            <Text size="sm">{name}</Text>
            <ReconstructionStatusLabel reconstructions={reconstructions}/>
        </Group>
    );
}
