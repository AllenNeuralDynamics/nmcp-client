import * as React from "react";
import {useState} from "react";
import {useQuery} from "@apollo/client";
import {Button, Icon, Modal, Tab, Message} from "semantic-ui-react";

import {AddInjectionPanel} from "./AddInjectionPanel";
import {EditInjectionsPanel} from "./EditInjections";
import {displaySample, ISample} from "../../models/sample";
import {INJECTIONS_FOR_SAMPLE_QUERY, InjectionsForSampleQueryResponse, InjectionsForSampleVariables} from "../../graphql/injection";
import {IInjection} from "../../models/injection";
import {IInjectionVirus} from "../../models/injectionVirus";
import {IFluorophore} from "../../models/fluorophore";

interface IManageInjectionsContentProps {
    sample: ISample;
    injections: IInjection[];
    injectionViruses: IInjectionVirus[];
    fluorophores: IFluorophore[];

    refetch(): any;
}

export const ManageInjectionsContent = (props: IManageInjectionsContentProps) => {
    const [state, setState] = useState({
        activeIndex: 0,
        injections: props.injections
    });

    if (state.injections === null) {
        return (
            <Message icon>
                <Icon name="circle notched" loading/>
                <Message.Content>
                    <Message.Header content="Loading Injections"/>
                    Loading labels for {displaySample(props.sample)}.
                </Message.Content>
            </Message>
        );
    }

    const panes = [
        {
            menuItem: "Add",
            render: () => (
                <Tab.Pane as="div">
                    <AddInjectionPanel sample={props.sample}
                                       fluorophores={props.fluorophores}
                                       injectionViruses={props.injectionViruses}
                                       refetch={props.refetch}/>
                </Tab.Pane>
            )
        },
        {
            menuItem: "Manage",
            render: () => <Tab.Pane as="div">
                <EditInjectionsPanel sample={props.sample}
                                     fluorophores={props.fluorophores}
                                     injectionViruses={props.injectionViruses}
                                     injections={props.injections}
                                     onSelectAddTab={() => setState({...state, activeIndex: 0})}/>
            </Tab.Pane>
        },
    ];

    return (
        <Tab activeIndex={state.activeIndex}
             menu={{secondary: true, pointing: true}}
             panes={panes}
             onTabChange={(e, {activeIndex}) => setState({...state, activeIndex: activeIndex as number})}/>
    )
}

interface IManageInjectionsProps {
    show: boolean;
    sample: ISample;

    onClose(): void;
}

export const ManageInjections = (props: IManageInjectionsProps) => {
    const {loading, error, data, refetch} = useQuery<InjectionsForSampleQueryResponse, InjectionsForSampleVariables>(INJECTIONS_FOR_SAMPLE_QUERY,
        {variables: {input: {sampleIds: props.sample ? [props.sample.id] : []}}, pollInterval: 5000});

    if (error || loading) {
        return null;
    }

    return (
        <Modal closeIcon centered={false} open={props.show} onClose={props.onClose} dimmer="blurring">
            <Modal.Header content={`Injections for ${displaySample(props.sample)}`}/>
            <Modal.Content>
                <ManageInjectionsContent sample={props.sample} injections={data.injections} injectionViruses={data.injectionViruses} fluorophores={data.fluorophores}
                                         refetch={refetch}/>
            </Modal.Content>
            <Modal.Actions>
                <Button color="blue" content="Close" onClick={props.onClose}/>
            </Modal.Actions>
        </Modal>
    );
}
