import * as React from "react";
import {Checkbox, Input} from "semantic-ui-react";
import {useState} from "react";

interface NeuronTagFilterProps {
    checked: boolean;
    initialValue: string;
    onCheckedChange: (checked: boolean) => void;
    onValueChange: (value: string) => void;
}

export const NeuronTagFilter: React.FC<NeuronTagFilterProps> = (props: NeuronTagFilterProps) => {

    const [state, setState] = useState({
        tagWhileTyping: props.initialValue,
    });

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (["Enter", "NumpadEnter"].includes(e.key)) {
            props.onValueChange(state.tagWhileTyping);
        }
    };

    const handleBlur = () => {
        props.onValueChange(state.tagWhileTyping);
    };

    const handleInputChange = (e: React.SyntheticEvent, {value}: { value: string }) => {
        setState({...state, tagWhileTyping: value});
    };

    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <Checkbox toggle label="Limit Tag" checked={props.checked} onChange={(_, data) => props.onCheckedChange(data.checked || false)}/>

            <div style={{marginLeft: "8px"}}>
                <Input size="mini" type="text" placeholder="..." value={state.tagWhileTyping} disabled={!props.checked}
                       style={{minWidth: "200px"}}
                       onKeyPress={handleKeyPress}
                       onBlur={handleBlur}
                       onChange={handleInputChange}
                />
            </div>
        </div>
    );
};
