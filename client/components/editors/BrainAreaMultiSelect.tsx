import * as React from "react";
import Select from "react-select";

import {displayBrainArea, IBrainArea} from "../../models/brainArea";

const customStyles = {
    dropdownIndicator: (provided) => ({
        ...provided,
        padding: "0px 8px"
    }),
    clearIndicator: (provided) => ({
        ...provided,
        padding: "0px 0px"
    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        visibility: "hidden"
    }),
    control: (provided) => ({
        ...provided,
        boxShadow: "none",
        minHeight: "34px",
        maxHeight: "34px"
    }),
    multiValue: (provided) => ({
        ...provided,
        color: "rgb(0, 126, 255)",
        backgroundColor: "rgba(0, 126, 255, 0.0784314)",
        border: " 1px solid rgba(0, 126, 255, 0.239216)",
        borderRadius: "2px"
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: "rgb(0, 126, 255)",
        padding: 0
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        borderLeft: "1px solid rgba(0, 126, 255, 0.239216)",
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
    compartments: IBrainArea[];
    selection: IBrainArea[];

    onSelectionChange(selection: IBrainArea[]): void;
}

export class BrainAreaMultiSelect extends React.Component<BrainAreaMultiSelectProps, {}> {
    public constructor(props: BrainAreaMultiSelectProps) {
        super(props);

        this.createCompartmentMap(props);
    }

    public componentWillReceiveProps(props: Readonly<BrainAreaMultiSelectProps>): void {
        this.createCompartmentMap(props);
    }

    public createCompartmentMap(props: BrainAreaMultiSelectProps) {
        if (!props.compartments || compartmentOptionMap.size > 0) {
            return;
        }

        props.compartments.map(c => {
            compartmentOptionMap.set(c.id, new CompartmentSelectOption(displayBrainArea(c), c.id, c));
        });
    }

    public render() {
        const options: any[] = this.props.compartments.map(o => compartmentOptionMap.get(o.id));

        const values: any[] = this.props.selection.map(s => compartmentOptionMap.get(s.id));

        const props = {
            name: `brain-area-multi-select`,
            placeholder: "Select...",
            value: values,
            options,
            isClearable: true,
            isSearchable: true,
            isMulti: true,
            styles: customStyles,
            filterOption: (option: any, filter: string) => filterBrainArea(option.data.data, filter),
            onChange: (selection: any[]) => this.props.onSelectionChange(selection.map(s => s.data))
        };

        return <Select {...props}/>;
    }

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
