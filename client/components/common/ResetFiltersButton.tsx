import * as React from "react";
import {ActionIcon, Tooltip} from "@mantine/core";
import {IconFilterOff} from "@tabler/icons-react";

export const ResetFiltersButton = ({onReset}: { onReset(): void }) => {
    return (
        <Tooltip label="Reset the filters to their defaults">
            <ActionIcon variant="subtle" aria-label="Reset filters" onClick={onReset}>
                <IconFilterOff size={18}/>
            </ActionIcon>
        </Tooltip>
    );
};
