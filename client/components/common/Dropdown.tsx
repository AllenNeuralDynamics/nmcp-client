import * as React from "react";
import {useState} from "react";
import {Box, Button, Combobox, Text, useCombobox} from "@mantine/core";
import {IconSelector} from "@tabler/icons-react";

type DropdownProps = {
    value: string;
    data: string[];
    onChange: (value: string) => void;

}

export function Dropdown({value, data, onChange}: DropdownProps) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const options = data.map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={combobox}
            width={250}
            position="bottom-start"
            withArrow
            withinPortal={false}
            onOptionSubmit={(val) => {
                onChange(val);
                combobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <Button miw={95} p={0} variant="transparent" fullWidth justify="space-between" rightSection={<IconSelector/>} onClick={() => combobox.toggleDropdown()}>{value}</Button>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}

