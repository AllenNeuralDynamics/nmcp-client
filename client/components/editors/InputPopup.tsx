import * as React from "react";
import {Input, Popup} from "semantic-ui-react";

type IsValidValueFcn = (value: string) => boolean;

type InputPopupProps = {
    header?: string;
    value?: string;
    placeholder?: string;

    isValidValueFcn?: IsValidValueFcn
    onAccept?(value: string): void;
}

type InputPopupState = {
    value?: string;
    isOpen?: boolean;
}

export class InputPopup extends React.Component<InputPopupProps, InputPopupState> {
    public constructor(props: InputPopupProps) {
        super(props);

        this.state = {
            value: props.value || "",
            isOpen: false
        }
    }

    public componentWillReceiveProps(nextProps: Readonly<InputPopupProps>, nextContext: any): void {
        if (!this.state.isOpen) {
            this.setState({value: this.props.value});
        }
    }

    private onKeyPress = (event: any) => {
        if ((event.charCode || event.which) === 13 && this.isValidValue()) {
            this.onAccept();
        }
    };

    private onAccept = () => {
        if (this.props.onAccept) {
            this.props.onAccept(this.state.value);
        }

        this.setState({isOpen: false})
    };

    private isValidValue(): boolean {
        return !this.props.isValidValueFcn || this.props.isValidValueFcn(this.state.value);
    }

    private onClose = () => {
        this.setState({isOpen: false, value: this.props.value});
    };

    public render() {
        return (
            <Popup open={this.state.isOpen} onOpen={() => this.setState({isOpen: true})}
                   onClose={this.onClose} on="click" flowing
                   header={this.props.header || ""}
                   trigger={<span>{this.props.value || "(none)"}</span>}
                   content={
                       <Input size="mini" placeholder={this.props.placeholder || ""}
                              style={{minWidth: "100px"}}
                              value={this.state.value}
                              onKeyPress={this.onKeyPress}
                              onChange={(e, data) => {
                                  this.setState({value: data.value.toString()})
                              }}
                              action={{
                                  icon: "check",
                                  color: "teal",
                                  size: "mini",
                                  disabled: !this.isValidValue(),
                                  onClick: this.onAccept
                              }}
                       />
                   }/>
        );
    }
}
