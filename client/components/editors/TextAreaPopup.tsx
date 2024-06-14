import * as React from "react";
import {Form, Popup} from "semantic-ui-react";

type TextAreaPProps = {
    header?: string;
    value?: string;
    placeholder?: string;
    limit?: number;

    onAccept?(value: string): void;
}

type TextAreaPState = {
    value?: string;
    isOpen?: boolean;
}

export class TextAreaPopup extends React.Component<TextAreaPProps, TextAreaPState> {
    public constructor(props: TextAreaPProps) {
        super(props);

        this.state = {
            value: props.value || "",
            isOpen: false
        }
    }

    public componentWillReceiveProps(nextProps: Readonly<TextAreaPProps>, nextContext: any): void {
        if (!this.state.isOpen) {
            this.setState({value: this.props.value});
        }
    }

    private onKeyPress = (event: any) => {
        if ((event.charCode || event.which) === 13) {
            this.props.onAccept(this.state.value);
        }
    };

    private onClose = () => {
        this.setState({isOpen: false, value: this.props.value});
    };

    public render() {
        const str = this.props.limit ? this.props.value?.substring(0, this.props.limit) || null : this.props.value;

        return (
            <Popup open={this.state.isOpen} onOpen={() => this.setState({isOpen: true})}
                   onClose={this.onClose} on="click" flowing
                   header={this.props.header || ""}
                   trigger={<span>{str || "(none)"}</span>}
                   content={
                       <Form>
                           <Form.TextArea size="mini" placeholder={this.props.placeholder || ""}
                                     style={{minWidth: "500px"}}
                                     value={this.state.value}
                                     onInput={this.onKeyPress}
                                     onChange={(e, data) => {
                                         this.setState({value: data.value.toString()})
                                     }}
                           />
                           <Form.Button size="mini" icon="check" labelPosition="right" content="OK" color="teal" floated="right" onClick={() => {
                               this.props.onAccept(this.state.value);
                               this.setState({isOpen: false})
                           }}/>
                       </Form>
                   }/>
        );
    }
}
