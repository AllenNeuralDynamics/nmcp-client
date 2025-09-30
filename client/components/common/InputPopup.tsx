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

export function InputPopup(props: InputPopupProps) {
    const [value, setValue] = React.useState<string>(props.value || "");
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!isOpen) {
            setValue(props.value || "");
        }
    }, [props.value, isOpen]);

    const onKeyPress = (event: any) => {
        if ((event.charCode || event.which) === 13 && isValidValue()) {
            onAccept();
        }
    };

    const onAccept = () => {
        if (props.onAccept) {
            props.onAccept(value);
        }
        setIsOpen(false);
    };

    const isValidValue = (): boolean => {
        return !props.isValidValueFcn || props.isValidValueFcn(value);
    };

    const onClose = () => {
        setIsOpen(false);
        setValue(props.value || "");
    };

    return (
        <Popup open={isOpen} onOpen={() => setIsOpen(true)}
               onClose={onClose} on="click" flowing
               header={props.header || ""}
               trigger={<span>{props.value || "(none)"}</span>}
               content={
                   <Input size="mini" placeholder={props.placeholder || ""}
                          style={{minWidth: "100px"}}
                          value={value}
                          onKeyPress={onKeyPress}
                          onChange={(e, data) => {
                              setValue(data.value.toString());
                          }}
                          action={{
                              icon: "check",
                              color: "teal",
                              size: "mini",
                              disabled: !isValidValue(),
                              onClick: onAccept
                          }}
                   />
               }/>
    );
}
