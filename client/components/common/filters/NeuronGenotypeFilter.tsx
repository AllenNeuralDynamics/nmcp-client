import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {Group, Switch, TextInput} from "@mantine/core";

import {OptionalFilter} from "../../../viewmodel/candidateFilter";

export const NeuronGenotypeFilter = observer(({filter}: { filter: OptionalFilter<string> }) => {
    const [state, setState] = useState({
        genotypeWhileTyping: filter.contents,
    });

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (["Enter", "NumpadEnter"].includes(e.key)) {
            filter.contents = state.genotypeWhileTyping;
        }
    };

    const handleBlur = () => {
        filter.contents = state.genotypeWhileTyping;
    };

    const handleInputChange = (value: string) => {
        setState({...state, genotypeWhileTyping: value});
    };

    return (
        <Group gap="sm" align="center">
            <Switch label="Genotype" checked={filter.isEnabled} onChange={(event) => filter.isEnabled = event.currentTarget.checked || false}/>

            <TextInput miw={200} placeholder="..." value={state.genotypeWhileTyping} disabled={!filter.isEnabled}
                       onKeyUp={handleKeyPress} onBlur={handleBlur} onChange={event => handleInputChange(event.currentTarget.value)}/>
        </Group>
    );
});
