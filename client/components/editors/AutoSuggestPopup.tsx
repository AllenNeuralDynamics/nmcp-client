import * as React from "react";
import * as AutoSuggest from "react-autosuggest";
import {Button, Label, Popup} from "semantic-ui-react";

import {INamedModel} from "../../models/namedModel";

export interface IObjectAutoSuggestProps<T extends INamedModel> {
    items: T[];
    header?: string;
    placeholder: string;
    value: string;
    placeHolder?: string;

    onChange?(value: string): void;
}

export interface IObjectAutoSuggestState<T extends INamedModel> {
    suggestions: T[];
    value?: string;
    isOpen?: boolean;
}

export function AutoSuggestPopup<T extends INamedModel>(props: IObjectAutoSuggestProps<T>) {
    const [suggestions, setSuggestions] = React.useState<T[]>([]);
    const [value, setValue] = React.useState<string>(props.value || "");
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!isOpen) {
            setValue(props.value || "");
        }
    }, [props.value, isOpen]);

    const onAcceptEdit = () => {
        if (props.onChange) {
            props.onChange(value);
        }
        setIsOpen(false);
    };

    const onAutoSuggestInputChange = (obj: any) => {
        setValue(obj.newValue);
    };

    const getSuggestions = (inputValue: string): T[] => {
        if (!props.items) {
            return [];
        }

        const trimmedValue = inputValue.trim().toLowerCase();
        const inputLength = trimmedValue.length;

        return inputLength === 0 ? [] : props.items.filter(item => {
                return item.name.toLowerCase().indexOf(trimmedValue) > -1;
            }
        );
    };

    const renderAutoSuggest = () => {
        const inputProps = {
            placeholder: props.placeholder,
            value: value || "",
            onChange: (event: any, obj: any) => onAutoSuggestInputChange(obj)
        };

        const autoSuggestProps = {
            theme: inputGroupTheme,
            suggestions: suggestions,
            onSuggestionsFetchRequested: (obj: any) => onSuggestionsFetchRequested(obj),
            onSuggestionsClearRequested: () => onSuggestionsClearRequested(),
            getSuggestionValue: (suggestion: any) => getSuggestionValue(suggestion),
            renderSuggestion: (suggestion: any) => renderSuggestion(suggestion),
            inputProps: inputProps
        };

        return (<AutoSuggest {...autoSuggestProps}/>);
    };

    const renderSuggestion = (suggestion: T) => {
        return (
            <div>
                {suggestion?.name}
            </div>
        );
    };

    const onSuggestionsFetchRequested = ({value: fetchValue}: any) => {
        setSuggestions(getSuggestions(fetchValue));
    };

    const onSuggestionsClearRequested = () => {
        setSuggestions([]);
    };

    const getSuggestionValue = (suggestion: T) => {
        return suggestion?.name ?? "";
    };

    return (
        <Popup open={isOpen} onOpen={() => setIsOpen(true)}
               onClose={() => setIsOpen(false)} on="click" flowing
               header={props.header || ""}
               trigger={<span>{props.value || "(none)"}</span>}
               content={

                   <Button as="div" labelPosition="left" fluid style={{display: "flex"}}>
                       <Label as="div" basic pointing="right"
                              style={{display: "flex", padding: 0, flexGrow: 1}}>
                           <div style={{flexGrow: 1}}>
                               {renderAutoSuggest()}
                           </div>
                       </Label>
                       <Button icon="check" color="teal" onClick={() => onAcceptEdit()}/>
                   </Button>}/>
    );
}

const standardTheme = {
    container: "react-autosuggest__container",
    containerOpen: "react-autosuggest__container--open",
    input: "react-autosuggest__input",
    inputOpen: "react-autosuggest__input--open",
    inputFocused: "react-autosuggest__input--focused",
    suggestionsContainer: "react-autosuggest__suggestions-container",
    suggestionsContainerOpen: "react-autosuggest__suggestions-container--open",
    suggestionsList: "react-autosuggest__suggestions-list",
    suggestion: "react-autosuggest__suggestion",
    suggestionFirst: "react-autosuggest__suggestion--first",
    suggestionHighlighted: "react-autosuggest__suggestion--highlighted",
    sectionContainer: "react-autosuggest__section-container",
    sectionContainerFirst: "react-autosuggest__section-container--first",
    sectionTitle: "react-autosuggest__section-title"
};

const inputGroupTheme = Object.assign({}, standardTheme, {input: "react-autosuggest__input_inputgroup"});
