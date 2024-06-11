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

export class AutoSuggestPopup<T extends INamedModel> extends React.Component<IObjectAutoSuggestProps<T>, IObjectAutoSuggestState<T>> {
    constructor(props: any) {
        super(props);

        this.state = {
            suggestions: [],
            value: props.initialValue
        };
    }

    private onAcceptEdit() {
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }

        this.setState({isOpen: false});
    }

    private onAutoSuggestInputChange(obj: any) {
        this.setState({
            value: obj.newValue
        });
    };

    private getSuggestions(value: string): T[] {
        if (!this.props.items) {
            return [];
        }

        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        return inputLength === 0 ? [] : this.props.items.filter(item => {
                return item.name.toLowerCase().indexOf(inputValue) > -1;
            }
        );
    }

    public componentWillReceiveProps(props: IObjectAutoSuggestProps<T>) {
        if (!this.state.isOpen) {
            this.setState({value: this.props.value});
        }
    }

    private renderAutoSuggest() {
        const inputProps = {
            placeholder: this.props.placeholder,
            value: this.state.value || "",
            onChange: (event: any, obj: any) => this.onAutoSuggestInputChange(obj)
        };


        const props = {
            theme: inputGroupTheme,
            suggestions: this.state.suggestions,
            onSuggestionsFetchRequested: (obj: any) => this.onSuggestionsFetchRequested(obj),
            onSuggestionsClearRequested: () => this.onSuggestionsClearRequested(),
            getSuggestionValue: (suggestion: any) => this.getSuggestionValue(suggestion),
            renderSuggestion: (suggestion: any) => this.renderSuggestion(suggestion),
            inputProps: inputProps
        };

        return (<AutoSuggest {...props}/>);
    }

    // Use your imagination to render suggestions.
    private renderSuggestion(suggestion: T) {
        return (
            <div>
                {suggestion?.name}
            </div>
        );
    }

    // Autosuggest will call this function every time you need to update suggestions.
    // You already implemented this logic above, so just use it.
    private onSuggestionsFetchRequested({value}: any) {
        this.setState({
            suggestions: this.getSuggestions(value)
        });
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    private onSuggestionsClearRequested() {
        this.setState({
            suggestions: []
        });
    }

    private getSuggestionValue(suggestion: T) {
        return suggestion?.name ?? "";
    }


    public render() {
        return (
            <Popup open={this.state.isOpen} onOpen={() => this.setState({isOpen: true})}
                   onClose={() => this.setState({isOpen: false})} on="click" flowing
                   header={this.props.header || ""}
                   trigger={<span>{this.props.value || "(none)"}</span>}
                   content={

                       <Button as="div" labelPosition="left" fluid style={{display: "flex"}}>
                           <Label as="div" basic pointing="right"
                                  style={{display: "flex", padding: 0, flexGrow: 1}}>
                               <div style={{flexGrow: 1}}>
                                   {this.renderAutoSuggest()}
                               </div>
                           </Label>
                           <Button icon="check" color="teal" onClick={() => this.onAcceptEdit()}/>
                       </Button>}/>
        );
    }
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
