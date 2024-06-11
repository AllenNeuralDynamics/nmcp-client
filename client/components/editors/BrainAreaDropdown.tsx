import * as React from "react";
import {Button, DropdownItemProps, Label} from "semantic-ui-react";
import Select from "react-select";

import {displayBrainArea, IBrainArea} from "../../models/brainArea";
import {NdbConstants} from "../../models/constants";
import {useContext, useState} from "react";
import {ConstantsContext} from "../app/AppConstants";

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
        boxShadow: "none",
        minHeight: "34px",
        maxHeight: "36px"
    }),
    multiValue: (provided: any) => ({
        ...provided,
        color: "rgb(0, 126, 255)",
        backgroundColor: "rgba(0, 126, 255, 0.0784314)",
        border: " 1px solid rgba(0, 126, 255, 0.239216)",
        borderRadius: "2px"
    }),
    multiValueLabel: (provided: any) => ({
        ...provided,
        color: "rgb(0, 126, 255)",
        padding: 0
    }),
    multiValueRemove: (provided: any) => ({
        ...provided,
        borderLeft: " 1px solid rgba(0, 126, 255, 0.239216)",
    })
};

const inlineEditStyles = {
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
        border: "none",
        boxShadow: "none",
        minHeight: "34px",
        maxHeight: "36px",
        fontWeight: "normal"
    }),
    menu: (provided: any) => ({
        ...provided,
        textAlign: "left",
        fontWeight: "normal"
    })
};

interface IBrainAreaDropdownProps {
    brainArea: IBrainArea;
    isEditOnly?: boolean;

    onBrainAreaChange(brainArea: IBrainArea): void;
}

interface IBrainAreaDropdownState {
    selectedBrainArea: IBrainArea;
    isInEditMode: boolean;
}

export const BrainAreaDropdown = (props: IBrainAreaDropdownProps) => {
    const [state, setState] = useState<IBrainAreaDropdownState>({
        isInEditMode: false,
        selectedBrainArea: props.brainArea
    });

    const constants = useContext(ConstantsContext);

    if (!state.isInEditMode && !props.isEditOnly) {
        return (
            <a onClick={() => setState({...state, isInEditMode: true})}>
                {`${displayBrainArea(state.selectedBrainArea || null)}`}
            </a>
        );
    }

    let selection: any = null;

    const items = constants.BrainAreas.map(b => {
        const option = {label: displayBrainArea(b), value: b.id};

        if (props.isEditOnly) {
            if (props.brainArea && props.brainArea.id === b.id) {
                selection = option;
            }
        } else {
            if (state.selectedBrainArea && state.selectedBrainArea.id === b.id) {
                selection = option;
            }
        }

        return option;
    });

    if (props.isEditOnly) {
        const selectProps = {
            name: `brain-area-select`,
            placeholder: "Select brain area...",
            value: selection,
            options: items,
            isClearable: false,
            isSearchable: true,
            isDisabled: false,
            isMulti: false,
            styles: customStyles,
            onChange: (option: any) => props.onBrainAreaChange(constants.findBrainArea(option.value))
        };

        return <Select {...selectProps}/>;
    }

    const selectProps = {
        name: `brain-area-select`,
        placeholder: "Select brain area...",
        value: selection,
        options: items,
        isClearable: false,
        isSearchable: true,
        isDisabled: false,
        isMulti: false,
        styles: inlineEditStyles,
        onChange: (option: any) => setState({...state, selectedBrainArea: constants.findBrainArea(option.value)})
    };

    return (
        <div>
            <Button as="div" size="mini" labelPosition="left" fluid style={{display: "flex"}}>
                <Label as="div" basic pointing="right" style={{padding: 0, flexGrow: 1}}>
                    <Button as="div" labelPosition="right" fluid style={{display: "flex"}}>
                        <Button size="mini" icon="cancel" onClick={() => setState({
                            isInEditMode: false,
                            selectedBrainArea: props.brainArea
                        })}/>
                        <Label as="div" basic pointing="left"
                               style={{display: "flex", padding: 0, flexGrow: 1, borderWidth: 0}}>
                            <div style={{flexGrow: 1}}>
                                <Select {...selectProps}/>
                            </div>
                        </Label>
                    </Button>
                </Label>
                <Button size="mini" icon="check" color="teal" onClick={() => {
                    props.onBrainAreaChange(state.selectedBrainArea);
                    setState({...state, isInEditMode: false})
                }}/>
            </Button>
        </div>
    );
}

function filterBrainArea(option: DropdownItemProps, filterValue: string) {
    const labelTest = option.text.toString().toLowerCase();

    if (labelTest.indexOf(filterValue) >= 0) {
        return true;
    }

    const parts = filterValue.split(/\s+/);

    if (parts.length < 2) {
        return false;
    }

    const itemParts = labelTest.split(/\s+/);

    return parts.some(p => {
        return itemParts.some(i => i === p);
    });
}

const brainAreaDeepSearch = (options: DropdownItemProps[], query: string) => {
    const filterValue = query.toLowerCase();

    const optionsInList = filterValue ? options.filter(option => {
        return filterBrainArea(option, filterValue);
    }) : options;

    return optionsInList.sort((a, b) => {
        const labelA = a.text.toString().toLowerCase();
        const labelB = b.text.toString().toLowerCase();

        if (labelA === filterValue) {
            return -1;
        }

        if (labelB === filterValue) {
            return 1;
        }

        const parts = filterValue.split(/\s+/);

        const partsA = labelA.split(/\s+/);
        const partsB = labelB.split(/\s+/);

        const areaA = NdbConstants.DefaultConstants.findBrainArea(a.value as string);
        if (!areaA) {
            return -1;
        }

        const areaB = NdbConstants.DefaultConstants.findBrainArea(b.value as string);
        if (!areaB) {
            return 1;
        }

        if (partsA.length > 1 && partsB.length > 1) {
            const countA = partsA.reduce((p, c) => {
                return parts.some(p => p === c) ? p + 1 : p;
            }, 0);

            const countB = partsB.reduce((p, c) => {
                return parts.some(p => p === c) ? p + 1 : p;
            }, 0);

            if (countA > 0 || countB > 0) {
                if (countA === countB) {
                    return areaA.structureIdPath.split("/").length - areaB.structureIdPath.split("/").length;
                } else {
                    return countB - countA;
                }
            }
        }

        return areaA.structureIdPath.split("/").length - areaB.structureIdPath.split("/").length;
    });
};
