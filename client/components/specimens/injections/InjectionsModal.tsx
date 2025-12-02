import * as React from "react";
import {useState} from "react";
import {useQuery} from "@apollo/client";
import {Modal, Tabs, Box, LoadingOverlay} from "@mantine/core";
import {IconPencil, IconPlus} from "@tabler/icons-react";

import {INJECTIONS_FOR_SPECIMEN_QUERY, InjectionsForSpecimenQueryResponse, InjectionsForSpecimenVariables} from "../../../graphql/injection";
import {SpecimenShape} from "../../../models/specimen";
import {InjectionShape} from "../../../models/injection";
import {InjectionVirusShape} from "../../../models/injectionVirus";
import {FluorophoreShape} from "../../../models/fluorophore";
import {AddInjection} from "./AddInjection";
import {EditInjectionsPanel} from "./ManageInjections";
import {GraphQLErrorAlert} from "../../common/GraphQLErrorAlert";

type ManageInjectionsContentProps = {
    sample: SpecimenShape;
    injections: InjectionShape[];
    injectionViruses: InjectionVirusShape[];
    fluorophores: FluorophoreShape[];

    refetch(): any;
}

export const ManageInjectionsContent = (props: ManageInjectionsContentProps) => {
    const [activeTab, setActiveTab] = useState<string | null>("Add");

    return (
        <Box pos="relative">
            <LoadingOverlay visible={props.injections === null} zIndex={1000} overlayProps={{radius: "sm", blur: 2}}/>
            <Tabs defaultValue="Add" value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                    <Tabs.Tab value="Add" leftSection={<IconPlus size={12}/>}>
                        Add
                    </Tabs.Tab>
                    <Tabs.Tab value="Manage" leftSection={<IconPencil size={12}/>}>
                        Manage
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="Add" p={12}>
                    <AddInjection sample={props.sample}
                                  fluorophores={props.fluorophores}
                                  injectionViruses={props.injectionViruses}
                                  refetch={props.refetch}/>
                </Tabs.Panel>

                <Tabs.Panel value="Manage" p={12}>
                    <EditInjectionsPanel sample={props.sample}
                                         fluorophores={props.fluorophores}
                                         injectionViruses={props.injectionViruses}
                                         injections={props.injections}
                                         refetch={props.refetch}
                                         onSelectAddTab={() => setActiveTab("Add")}/>
                </Tabs.Panel>
            </Tabs>
        </Box>
    )
}

interface ManageInjectionsProps {
    show: boolean;
    sample: SpecimenShape;

    onClose(): void;
}

export const InjectionsModal = (props: ManageInjectionsProps) => {
    const {loading, error, data, refetch} = useQuery<InjectionsForSpecimenQueryResponse, InjectionsForSpecimenVariables>(INJECTIONS_FOR_SPECIMEN_QUERY,
        {variables: {input: {specimenIds: props.sample ? [props.sample.id] : []}}, pollInterval: 5000});

    if (error) {
        return <GraphQLErrorAlert title="Injections for Specimen Could not be Loaded" error={error}/>;
    }

    if (loading) {
        return null;
    }

    return (
        <Modal centered size="65rem" opened={props.show} onClose={props.onClose} title={`Injections for ${props.sample.label}`}>
            <ManageInjectionsContent sample={props.sample} injections={data.injections} injectionViruses={data.injectionViruses}
                                     fluorophores={data.fluorophores} refetch={refetch}/>
        </Modal>
    );
}
