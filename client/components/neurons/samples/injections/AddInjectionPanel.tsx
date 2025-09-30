import * as React from "react";
import {Button, Form, Header} from "semantic-ui-react";
import {toast} from "react-toastify";

import {ISample} from "../../../../models/sample";
import {IInjectionVirus} from "../../../../models/injectionVirus";
import {VirusAutoSuggest} from "../../../common/VirusAutoSuggest";
import {IFluorophore} from "../../../../models/fluorophore";
import {IBrainArea} from "../../../../models/brainArea";
import {FluorophoreAutoSuggest} from "../../../common/FluorophoreAutoSuggest";
import {toastCreateError, toastCreateSuccess} from "../../../common/Toasts";
import update from "immutability-helper";
import {BrainAreaDropdown} from "../../../common/BrainAreaDropdown";
import {CREATE_INJECTION_MUTATION, CreateInjectionMutationData, CreateInjectionMutationResponse, CreateInjectionVariables} from "../../../../graphql/injection";
import {isNullOrUndefined} from "../../../../util/nodeUtil";
import {useContext, useState} from "react";
import {useMutation} from "@apollo/client";
import {ConstantsContext} from "../../../app/AppConstants";

interface IAddInjectionProps {
    sample: ISample;
    injectionViruses: IInjectionVirus[];
    fluorophores: IFluorophore[];

    refetch(): any;
}

export const AddInjectionPanel = (props: IAddInjectionProps) => {
    const [state, setState] = useState({
        injection: {
            id: null,
            injectionVirusId: null,
            injectionVirusName: null,
            fluorophoreId: null,
            fluorophoreName: null,
            brainAreaId: null,
            sampleId: props.sample.id
        }
    });

    const constants = useContext(ConstantsContext)

    const isValidBrainAreaId = (): boolean => {
        return !isNullOrUndefined(state.injection.brainAreaId);
    }

    const isValidCreateState = (): boolean => {
        return !isNullOrUndefined(state.injection.injectionVirusName)
            && !isNullOrUndefined(state.injection.fluorophoreName)
            && isValidBrainAreaId()
    }

    const onVirusChange = (value: string) => {
        setState(update(state, {injection: {injectionVirusName: {$set: value.length === 0 ? null : value}}}));
    }

    const onFluorophoreChange = (value: string) => {
        setState(update(state, {injection: {fluorophoreName: {$set: value.length === 0 ? null : value}}}));
    }

    const onBrainAreaChange = (brainArea: IBrainArea) => {
        setState(update(state, {injection: {brainAreaId: {$set: brainArea ? brainArea.id : null}}}));
    }

    const onInjectionCreated = (data: CreateInjectionMutationData) => {
        if (!data.source || data.error) {
            toast.error(toastCreateError(data.error), {autoClose: false});
        } else {
            props.refetch();
            toast.success(toastCreateSuccess());
        }
    }

    const [createInjection, _] = useMutation<CreateInjectionMutationResponse, CreateInjectionVariables>(CREATE_INJECTION_MUTATION,
        {
            refetchQueries: ["AppQuery"],
            onCompleted: (data) => onInjectionCreated(data.createInjection),
            onError: (error) => toast.error(toastCreateError(error), {autoClose: false})
        });

    return (
        <div>
            <Header content="Add Labeling"/>
            <Form>
                <Form.Field>
                    <label>Brain Area</label>
                    <BrainAreaDropdown isEditOnly={true}
                                       brainArea={constants.findBrainArea(state.injection.brainAreaId)}
                                       onBrainAreaChange={(brainArea: IBrainArea) => onBrainAreaChange(brainArea)}/>
                </Form.Field>
                <Form.Field>
                    <label>Virus</label>
                    <VirusAutoSuggest items={props.injectionViruses}
                                      placeholder="select or name a new virus"
                                      initialValue={state.injection.injectionVirusName}
                                      isDeferredEditMode={false}
                                      isEditOnly={true}
                                      onChange={(v: string) => onVirusChange(v)}/>
                </Form.Field>
                <Form.Field>
                    <label>Fluorophore</label>
                    <FluorophoreAutoSuggest items={props.fluorophores}
                                            placeholder="select or name a new fluorophore"
                                            initialValue={state.injection.fluorophoreName}
                                            isDeferredEditMode={false}
                                            isEditOnly={true}
                                            onChange={(v: string) => onFluorophoreChange(v)}/>
                </Form.Field>
                <Button color="teal" content="Add" disabled={!isValidCreateState()}
                        onClick={() => createInjection({variables: {injectionInput: state.injection}})}/>
            </Form>
        </div>
    );
}
