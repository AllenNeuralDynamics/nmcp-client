import * as React from "react";
import {Form, Popup} from "semantic-ui-react";

type TextAreaPProps = {
    header?: string;
    value?: string;
    placeholder?: string;
    limit?: number;

    onAccept?(value: string): void;
}

export function TextAreaPopup(props: TextAreaPProps) {
    const [value, setValue] = React.useState<string>(props.value || "");
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!isOpen) {
            setValue(props.value || "");
        }
    }, [props.value, isOpen]);

    const onKeyPress = (event: any) => {
        if ((event.charCode || event.which) === 13) {
            props.onAccept?.(value);
        }
    };

    const onClose = () => {
        setIsOpen(false);
        setValue(props.value || "");
    };

    const handleAccept = () => {
        props.onAccept?.(value);
        setIsOpen(false);
    };

    const str = props.limit ? props.value?.substring(0, props.limit) || null : props.value;

    return (
        <Popup open={isOpen} onOpen={() => setIsOpen(true)}
               onClose={onClose} on="click" flowing
               header={props.header || ""}
               trigger={<span>{str || "(none)"}</span>}
               content={
                   <Form>
                       <Form.TextArea size="mini" placeholder={props.placeholder || ""}
                                 style={{minWidth: "500px"}}
                                 value={value}
                                 onInput={onKeyPress}
                                 onChange={(e, data) => {
                                     setValue(data.value.toString());
                                 }}
                       />
                       <Form.Button size="mini" icon="check" labelPosition="right" content="OK" color="teal" floated="right" onClick={handleAccept}/>
                   </Form>
               }/>
    );
}
