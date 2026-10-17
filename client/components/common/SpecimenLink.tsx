import * as React from "react";
import {Link} from "react-router-dom";
import {Text} from "@mantine/core";

import {SpecimenShape} from "../../models/specimen";

export const SpecimenLink = ({specimen}: { specimen: SpecimenShape }) => {
    return (
        <Link style={{color: "var(--mantine-color-text)"}} to={`/specimen/${specimen?.id}`}>
            <Text size="sm" td="underline">
                {specimen?.label}
            </Text>
        </Link>
    );
}
