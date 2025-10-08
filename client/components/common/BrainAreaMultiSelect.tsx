import * as React from "react";
import Select from "react-select";

import {displayBrainArea, IBrainArea} from "../../models/brainArea";
import {useEffect, useRef} from "react";
import {useConstants} from "../../hooks/useConstants";

const customStyles = {
    dropdownIndicator: (provided: any) => ({
        ...provided,
        padding: "0px 8px"
    }),
    clearIndicator: (provided: any) => ({
        ...provided,
        padding: "0px 0px"
    }),
    indicatorSeparator: (provided: any) => ({
        ...provided,
        visibility: "hidden"
    }),
    control: (provided: any) => ({
        ...provided,
        // boxShadow: "none",
        minHeight: "34px",
        maxHeight: "34px"
    }),
    multiValue: (provided: any) => ({
        ...provided,
        // color: "rgb(0, 126, 255)",
        // backgroundColor: "rgba(0, 126, 255, 0.0784314)",
        // border: " 1px solid rgba(0, 126, 255, 0.239216)",
        padding: "4px",
        borderRadius: "8px"
    }),
    multiValueLabel: (provided: any) => ({
        ...provided,
        // color: "rgb(0, 126, 255)",
        padding: 0
    }),
    multiValueRemove: (provided: any) => ({
        ...provided,
        // borderLeft: "1px solid rgba(0, 126, 255, 0.239216)",
    })
};

class CompartmentSelectOption {
    public label: string;
    public value: string;
    public data: IBrainArea;

    public constructor(label: string, value: string, compartment: IBrainArea) {
        this.label = label;
        this.value = value;
        this.data = compartment;
    }
}

const compartmentOptionMap = new Map<string, CompartmentSelectOption>();

export type BrainAreaMultiSelectProps = {
    selection: IBrainArea[];
    disabled?: boolean;

    onSelectionChange(selection: IBrainArea[]): void;
}

export const BrainAreaMultiSelect: React.FC<BrainAreaMultiSelectProps> = (props) => {
    const constants = useConstants();

    const options = useRef<CompartmentSelectOption[]>([]);

    const compartments = constants.BrainAreas;

    useEffect(() => {
        if (!compartments || compartmentOptionMap.size > 0) {
            return;
        }

        compartments.map(c => {
            compartmentOptionMap.set(c.id, new CompartmentSelectOption(displayBrainArea(c), c.id, c));
        });
    }, []);

    if (options.current.length == 0 && compartmentOptionMap.size > 0) {
        options.current = Array.from(compartmentOptionMap.values()).sort((s1, s2) => s1.label.localeCompare(s2.label));
    }

    const values: any[] = props.selection.map(s => compartmentOptionMap.get(s.id));

    const selectProps = {
        name: `brain-area-multi-select`,
        placeholder: "Select...",
        value: values,
        options: options.current,
        isClearable: true,
        isSearchable: true,
        isMulti: true,
        isDisabled: props.disabled,
        styles: customStyles,
        filterOption: (option: any, filter: string) => filterBrainArea(option.data.data, filter),
        onChange: (selection: any[]) => props.onSelectionChange(selection.map(s => s.data))
    };

    return <Select {...selectProps}/>;
}

function filterBrainArea(compartment: IBrainArea, value: string) {
    if (!value) {
        return true;
    }

    const filterValue = value.toLowerCase();

    if (compartment.name.toLowerCase().includes(filterValue)) {
        return true;
    }

    if (compartment.acronym.toLowerCase().includes(filterValue)) {
        return true;
    }

    const matches = compartment.aliasList?.some(a => a.toLowerCase().includes(filterValue));

    if (matches) {
        return true;
    }

    const parts = filterValue.split(/\s+/);

    if (parts.length < 2) {
        return false;
    }

    const itemParts = compartment.name.split(/\s+/);

    return parts.some(p => {
        return itemParts.some(i => i === p);
    });
}
