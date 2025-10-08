import * as React from "react";
import {CSSProperties} from "react";
import Select from "react-select";

// Indicators cause the vertical height to be 38 with default font settings and the default
// vertical padding of 8.

// The separator was not in the original abd does not match semantic-ui so removing.

// The box shadow on control creates a bad double border on focus.  Need to reduce default min height to allow it to
// compress after lowering indicator padding.

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

export interface IDynamicSelectOption {
    id?: string | number;
}

export interface IDynamicSelectProps<T, S, U> {
    idName: string;
    options: T[];
    selectedOption: S;
    disabled?: boolean;
    placeholder?: string;
    multiSelect?: boolean;
    clearable?: boolean;
    searchable?: boolean;
    useVirtualized?: boolean;
    style?: CSSProperties,
    userData?: U;

    // filterOptions?(options: Option[], filterValue: string, currentValues: Option[]): Option[];
    // filterOption?(option: string, filter: string): boolean;
    filterOption?(option: object, filter: string): boolean;
    onSelect(option: S): void;
    onRequestAdd?(): void;
}

export interface IDynamicSelectState<T> {
    selectedOption?: T;
}

// T Defines individual options (e.g., ISample)
// S Defines selected options (e.g., ISample for single select, ISample[] for multi-select)
// P Defines expected deliverable on select (Option for single select, Option[] for multi-select)
// U Defines type of optional user-defined prop data
export class DynamicSelect<T, S, P, U> extends React.Component<IDynamicSelectProps<T, S, U>, IDynamicSelectState<S>> {

    public constructor(props: IDynamicSelectProps<T, S, U>) {
        super(props);

        this.state = {selectedOption: props.selectedOption};
    }

    protected findSelectedObject(option: P): S {
        return null;
    }

    private onSelectChange(option: P) {
        const selectedObject: S = this.findSelectedObject(option);

        if (this.props.onSelect) {
            this.props.onSelect(selectedObject);
        }
    }

    public componentWillReceiveProps(props: IDynamicSelectProps<T, S, U>) {
        this.setState({selectedOption: props.selectedOption});
    }

    protected selectValueForOption(option: T): any {
        return option;
    }

    protected selectLabelForOption(option: T): any {
        return option.toString();
    }

    protected isSelectedOption(object: T, selectedOption: S) {
        return false;
    }

    protected addToSelection(option: any, selection: any): any {
    }

    protected filterOption?(option: object, filter: string): boolean {
        if (this.props.filterOption) {
            return this.props.filterOption(option, filter);
        }

        return true;
    }

    protected renderSelect(selected: any, options: any[]) {
        const props = {
            name: `${this.props.idName}-select`,
            placeholder: this.props.placeholder || "Select...",
            value: selected,
            options: options,
            isClearable: this.props.clearable,
            isSearchable: this.props.searchable !== false,
            isDisabled: this.props.disabled,
            isMulti: this.props.multiSelect,
            styles: customStyles,
            filterOption: (option: object, filter: string) => this.filterOption(option, filter),
            onChange: (option: P) => this.onSelectChange(option)
        };

        return <Select {...props}/>;
    }

    public render() {
        let selection: any = null;

        const options = this.props.options.map(o => {
            const option = {label: this.selectLabelForOption(o), value: this.selectValueForOption(o)};

            if (this.state.selectedOption && this.isSelectedOption(o, this.state.selectedOption)) {
                selection = this.addToSelection(option, selection);
            }

            return option;
        });

        return this.renderSelect(selection, options);
    }
}

export class DynamicSingleSelect<T extends IDynamicSelectOption, U> extends DynamicSelect<T, T, any, U> {
    protected findSelectedObject(option: any): T {
        return option ? this.props.options.filter(s => s.id === option.value)[0] : null;
    }

    protected selectValueForOption(option: T): any {
        return option.id;
    }

    protected isSelectedOption(object: T, selectedOption: T) {
        return object.id === selectedOption.id;
    }

    protected addToSelection(option: T, selection: T) {
        return option;
    }
}

export class DynamicSimpleSelect<T extends IDynamicSelectOption> extends DynamicSingleSelect<T, any> {
}
