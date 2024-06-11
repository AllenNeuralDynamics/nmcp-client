import * as React from "react";
import {Button, Label} from "semantic-ui-react";
import * as AutoSuggest from "react-autosuggest";

import {INamedModel} from "../../models/namedModel";

export enum DynamicAutoSuggestMode {
    Static,
    Edit
}

export interface IObjectAutoSuggestProps<T extends INamedModel> {
    items: T[];
    placeholder: string;
    initialValue: string;
    isDeferredEditMode?: boolean;
    isEditOnly?: boolean;
    placeHolder?: string;

    onChange?(value: string): void;
}

export interface IObjectAutoSuggestState<T extends INamedModel> {
    suggestions: T[];
    initialPropValue?: any;
    value?: string;
    mode?: DynamicAutoSuggestMode;
}

export class DynamicAutoSuggest<T extends INamedModel> extends React.Component<IObjectAutoSuggestProps<T>, IObjectAutoSuggestState<T>> {
    constructor(props: any) {
        super(props);

        this.state = {
            suggestions: [],
            initialPropValue: props.initialValue,
            value: props.initialValue,
            mode: DynamicAutoSuggestMode.Static
        };
    }

    private get isInEditMode() {
        return (this.props.isEditOnly) || this.state.mode === DynamicAutoSuggestMode.Edit;
    }

    private get isDeferredEditMode() {
        return !(this.props.isDeferredEditMode === undefined || this.props.isDeferredEditMode === null) && this.props.isDeferredEditMode;
    }

    private onRequestEditMode() {
        this.setState({mode: DynamicAutoSuggestMode.Edit});
    }

    private onAcceptEdit() {
        this.setState({mode: DynamicAutoSuggestMode.Static});

        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    }

    private onCancelEdit() {
        this.setState({mode: DynamicAutoSuggestMode.Static, value: this.props.initialValue});
    }

    private onAutoSuggestInputChange(obj: any) {
        this.setState({
            value: obj.newValue
        });

        if (this.isInEditMode && !this.isDeferredEditMode) {
            if (this.props.onChange) {
                this.props.onChange(obj.newValue);
            }
        }
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
        this.setState({
            initialPropValue: props.initialValue
        });

        if (this.state.mode === DynamicAutoSuggestMode.Static) {
            this.setState({
                value: props.initialValue
            });
        }
    }

    private renderClickableValue() {
        return (
            <a onClick={() => this.onRequestEditMode()}>
                {this.renderValue(this.state.value)}
            </a>
        )
    }

    protected renderValue(value: string) {
        if (!value) {
            return (<span style={{color: "#AAA"}}>{this.props.placeHolder || "(none)"}</span>)
        }

        return value;
    }

    private renderAutoSuggest(isInputGroup: boolean = false) {
        const inputProps = {
            placeholder: this.props.placeholder,
            value: this.state.value || "",
            onChange: (event: any, obj: any) => this.onAutoSuggestInputChange(obj)
        };

        const theme = isInputGroup ? inputGroupTheme : standardTheme;

        const props = {
            theme: theme,
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
        if (this.isInEditMode) {
            if (!this.isDeferredEditMode) {
                return this.renderAutoSuggest();
            } else {
                return (
                    <Button as="div" size="mini" labelPosition="left" fluid style={{display: "flex"}}>
                        <Label as="div" basic pointing="right" style={{padding: 0, flexGrow: 1}}>
                            <Button as="div" size="mini" labelPosition="right" fluid style={{display: "flex"}}>
                                <Button size="mini" icon="cancel" onClick={() => this.onCancelEdit()}/>
                                <Label as="div" basic pointing="left"
                                       style={{display: "flex", padding: 0, flexGrow: 1, borderWidth: 0}}>
                                    <div style={{flexGrow: 1}}>
                                        {this.renderAutoSuggest(true)}
                                    </div>
                                </Label>
                            </Button>
                        </Label>
                        <Button size="mini" icon="check" color="teal" onClick={() => this.onAcceptEdit()}/>
                    </Button>
                );
            }
        } else {
            return this.renderClickableValue();
        }
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
