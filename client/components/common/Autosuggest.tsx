import * as React from "react";
import {useEffect, useState} from "react";
import {Combobox, TextInput, useCombobox} from '@mantine/core';

export interface AutosuggestData {
    id: string;
    name: string;
}

type AutoSuggestProps<T extends AutosuggestData> = {
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    suggestAllWhenNotFound?: boolean;
    immediateMode?: boolean;
    data: T[];
    value: string;
    w?: number | string;

    onChange(value: string): void;
}

export function Autosuggest<T extends AutosuggestData>(props: AutoSuggestProps<T>) {
    const [value, setValue] = useState(props.value);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    let filteredSuggestions = value ? props.data.filter((item) => item.name.toLowerCase().includes(value.toLowerCase().trim())) : [];

    if (filteredSuggestions.length == 0 && props.suggestAllWhenNotFound) {
        filteredSuggestions = props.data;
    }

    const options = filteredSuggestions.map((item) => (
        <Combobox.Option value={item.name} key={item.id}>
            {item.name}
        </Combobox.Option>
    ));

    useEffect(() => {
        // Wait for options to render before selecting the first one.
        combobox.selectFirstOption();
    }, [props.value]);

    const onChange = (optionValue: string, canDefer: boolean = false) => {
        setValue(optionValue);
        if (!canDefer || props.immediateMode) {
            props.onChange(optionValue);
        }
    }

    const subProps = (props.w != undefined && props.w != null) ? {w: props.w} : {};

    return (
        <Combobox
            onOptionSubmit={(optionValue) => {
                onChange(optionValue);
                combobox.closeDropdown();
            }}
            store={combobox}
            withinPortal={false}
            disabled={props.disabled ?? false}
            {...subProps}
        >
            <Combobox.Target>
                <TextInput
                    label={props.label ?? null}
                    placeholder={props.placeholder ?? null}
                    value={value}
                    onChange={(event) => {
                        onChange(event.currentTarget.value, true);
                        combobox.openDropdown();
                    }}
                    onKeyUp={(evt) => {if (["Enter", "NumpadEnter"].includes(evt.key)) {
                        onChange(evt.currentTarget.value);
                    }}}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={(evt) => {onChange(evt.currentTarget.value); combobox.closeDropdown();}}
                />
            </Combobox.Target>

            {options.length > 0 ?
                <Combobox.Dropdown>
                    <Combobox.Options>
                        {options}
                    </Combobox.Options>
                </Combobox.Dropdown> : null}
        </Combobox>
    );
}
