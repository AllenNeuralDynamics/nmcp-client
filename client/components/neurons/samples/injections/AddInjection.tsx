import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Group, Stack, Text} from "@mantine/core";

import {useConstants} from "../../../../hooks/useConstants";
import {SpecimenShape} from "../../../../models/specimen";
import {InjectionVirusShape} from "../../../../models/injectionVirus";
import {FluorophoreShape} from "../../../../models/fluorophore";
import {AtlasStructureShape} from "../../../../models/atlasStructure";
import {toastCreateError, toastCreateSuccess} from "../../../common/NotificationHelper";
import {
    CREATE_INJECTION_MUTATION,
    CreateInjectionMutationResponse,
    CreateInjectionVariables, INJECTIONS_FOR_SPECIMEN_QUERY,
    InjectionVariables
} from "../../../../graphql/injection";
import {isNullOrUndefined} from "../../../../util/nodeUtil";
import {AtlasStructureSelect} from "../../../common/AtlasStructureSelect";
import {Autosuggest} from "../../../common/Autosuggest";
import {SPECIMENS_QUERY} from "../../../../graphql/specimen";
import {InjectionShape} from "../../../../models/injection";

type AddInjectionProps = {
    sample: SpecimenShape;
    injectionViruses: InjectionVirusShape[];
    fluorophores: FluorophoreShape[];
    // TODO pass in injections that are already loaded in InjectionsModal so we can highlight when an atlas structure already has an injection on the specimen
    //  instead of waiting for the call to fail.

    refetch(): any;
}

export const AddInjection = (props: AddInjectionProps) => {
    const constants = useConstants().AtlasConstants;

    const [state, setState] = useState<InjectionVariables>({
        specimenId: props.sample.id,
        atlasStructureId: null,
        injectionVirusName: null,
        fluorophoreName: null
    });

    const [createInjection, _] = useMutation<CreateInjectionMutationResponse, CreateInjectionVariables>(CREATE_INJECTION_MUTATION,
        {
            refetchQueries: [SPECIMENS_QUERY, {query: INJECTIONS_FOR_SPECIMEN_QUERY, variables: {input: {specimenIds: [props.sample.id]}}}],
            onCompleted: (data) => onInjectionCreated(data.createInjection),
            onError: (error) => toastCreateError(error)
        });

    const isValidAtlasStructureId = (): boolean => {
        return !isNullOrUndefined(state.atlasStructureId);
    }

    const isValidCreateState = (): boolean => {
        return !isNullOrUndefined(state.injectionVirusName)
            && !isNullOrUndefined(state.fluorophoreName)
            && isValidAtlasStructureId()
    }

    const onVirusChange = (value: string) => {
        setState({...state, injectionVirusName: value.length === 0 ? null : value});
    }

    const onFluorophoreChange = (value: string) => {
        setState({...state, fluorophoreName: value.length === 0 ? null : value});
    }

    const onStructureChange = (structure: AtlasStructureShape) => {
        setState({...state, atlasStructureId: structure ? structure.id : null});
    }

    const onInjectionCreated = (injection: InjectionShape) => {
        if (!injection) {
            toastCreateError("The injection was not created.");
        } else {
            props.refetch();
            toastCreateSuccess(`The injection was created and added to the specimen.`);
        }
    }

    return (
        <Stack>
            <Text fw={500}>Add Labeling</Text>
            <AtlasStructureSelect label="Atlas Structure" value={constants.findStructure(state.atlasStructureId)} onChange={onStructureChange}/>
            <Autosuggest label="Virus" immediateMode placeholder="select or name a new virus" data={props.injectionViruses}
                         value={state.injectionVirusName} onChange={onVirusChange}/>
            <Autosuggest label="Fluorophore" immediateMode placeholder="select or name a new fluorophore" data={props.fluorophores}
                         value={state.fluorophoreName} onChange={onFluorophoreChange}/>
            <Group justify="start">
                <Button color="teal" disabled={!isValidCreateState()} onClick={() => createInjection({variables: {injectionInput: state}})}>
                    Add
                </Button>
            </Group>
        </Stack>
    );
}
