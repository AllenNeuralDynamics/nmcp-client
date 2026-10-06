import * as React from "react";
import {Select} from "@mantine/core";

import {useConstants} from "../../hooks/useConstants";

type AtlasSelectProps = {
    value: string;

    onChange?(value: string): void;
}

export const AtlasSelect = ({value, onChange}: AtlasSelectProps) => {
    const options = useConstants().Atlases.map(a => ({label: a.name, value: a.id}));

    const isError = options.length == 0;

    const placeholder = isError ? "No atlases defined" : null;

    return <Select disabled={isError} allowDeselect={false} placeholder={placeholder} data={options} value={value} error={isError} onChange={onChange}
                   rightSectionPointerEvents="auto"/>;
};
