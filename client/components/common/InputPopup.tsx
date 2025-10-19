import * as React from "react";
import {useState} from "react";
import {Anchor, Popover, Text, TextInput} from "@mantine/core";

type IsValidValueFcn = (value: string) => boolean;

type InputPopupProps = {
    label?: string;
    value?: string;
    target?: React.JSX.Element | string;
    placeholder?: string;

    isValidValueFcn?: IsValidValueFcn
    onAccept?(value: string): void;
}

export function InputPopup(props: InputPopupProps) {
    const [value, setValue] = useState<string>(props.value || "");
    const [isOpen, setIsOpen] = useState<boolean>(false);

    React.useEffect(() => {
        if (!isOpen) {
            setValue(props.value || "");
        }
    }, [props.value, isOpen]);

    const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key == "Enter" && isValidValue()) {
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

    const target = (props.target == null || typeof props.target === "string") ? <Text size="sm">{(props.target ?? props.value) || "(none)"}</Text> : props.target;

    return (
        <Popover width={300} opened={isOpen} onChange={setIsOpen} trapFocus position="bottom" withArrow shadow="md">
            <Popover.Target>
                <Text size="sm" onClick={() => setIsOpen(true)}>{target}</Text>
            </Popover.Target>
            <Popover.Dropdown>
                <TextInput label={props.label} placeholder={props.placeholder} size="sm" value={value} onKeyUp={onKeyPress}
                           onChange={(e) => setValue(e.currentTarget.value)}/>
            </Popover.Dropdown>
        </Popover>
    );
}
