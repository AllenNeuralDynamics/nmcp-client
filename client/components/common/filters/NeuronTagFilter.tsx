import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {Group, Switch, TextInput} from "@mantine/core";

import {OptionalFilter} from "../../../viewmodel/candidateFilter";

export const NeuronTagFilter = observer(({filter}: { filter: OptionalFilter<string> }) => {
    const [state, setState] = useState({
        tagWhileTyping: filter.contents,
    });

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (["Enter", "NumpadEnter"].includes(e.key)) {
            filter.contents = state.tagWhileTyping;
        }
    };

    const handleBlur = () => {
        filter.contents = state.tagWhileTyping;
    };

    const handleInputChange = (value: string) => {
        setState({...state, tagWhileTyping: value});
    };

    return (
        <Group gap="sm" align="center">
            <Switch label="Keywords" checked={filter.isEnabled} onChange={(event) => filter.isEnabled = event.currentTarget.checked || false}/>

            <TextInput miw={200} placeholder="..." value={state.tagWhileTyping} disabled={!filter.isEnabled} onKeyUp={handleKeyPress} onBlur={handleBlur}
                       onChange={event => handleInputChange(event.currentTarget.value)}/>
        </Group>
    );
});
