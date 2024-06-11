import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/react-hooks";
import {Button, Segment, Confirm, Header, Dropdown, List, Label} from "semantic-ui-react";
import {toast} from "react-toastify";
import * as ReactDatePickerMod from "react-datepicker";

const ReactDatePicker = ReactDatePickerMod.default;

import {toastCreateError, toastDeleteError, toastUpdateError} from "../editors/Toasts";
import {displaySample, ISample} from "../../models/sample";
import {IMouseStrain} from "../../models/mouseStrain";
import {PaginationHeader} from "../editors/PaginationHeader";
import {CREATE_SAMPLE_MUTATION, DELETE_SAMPLE_MUTATION, UPDATE_SAMPLE_MUTATION, CreateSampleMutationData, UpdateSampleMutationData} from "../../graphql/sample";
import ReactTable from "react-table";
import {FindVisibilityOption, SampleVisibilityOptions, ShareVisibility} from "../../models/shareVisibility";
import moment from "moment";
import {InputPopup} from "../editors/InputPopup";
import {TextAreaPopup} from "../editors/TextAreaPopup";
import {AutoSuggestPopup} from "../editors/AutoSuggestPopup";
import {displayInjection, IInjection} from "../../models/injection";
import {ManageInjections} from "../injections/ManageInjections";
import {UserPreferences} from "../../util/userPreferences";

interface ISamplesProps {
    samples: ISample[];
    mouseStrains: IMouseStrain[];
}

interface ISamplesState {
    offset?: number;
    limit?: number;
    requestedSampleForDelete?: ISample;
    isInjectionDialogShown?: boolean;
    manageInjectionsSample?: ISample;
}

export const SamplesReactTable = (props: ISamplesProps) => {
    const [state, setState] = useState<ISamplesState>({
        offset: UserPreferences.Instance.samplePageOffset,
        limit: UserPreferences.Instance.samplePageLimit,
        requestedSampleForDelete: null,
        isInjectionDialogShown: false,
        manageInjectionsSample: null
    })

    const onUpdateOffsetForPage = (page: number) => {
        const offset = state.limit * (page - 1);

        if (offset !== state.offset) {
            setState({...state, offset});

            UserPreferences.Instance.samplePageOffset = offset;
        }
    }

    const onUpdateLimit = (limit: number) => {
        if (limit !== state.limit) {
            let offset = state.offset;

            if (offset < limit) {
                offset = 0;
            }

            setState({...state, offset, limit});

            UserPreferences.Instance.samplePageOffset = offset;
            UserPreferences.Instance.samplePageLimit = limit;
        }
    }

    const onRequestManageInjections = (forSample: ISample) => {
        setState({
            ...state,
            isInjectionDialogShown: true,
            manageInjectionsSample: forSample
        });
    }

    const renderInjectionsDialog = () => {
        if (state.manageInjectionsSample && state.isInjectionDialogShown) {
            return (
                <ManageInjections sample={state.manageInjectionsSample}
                                  show={state.isInjectionDialogShown}
                                  onClose={() => setState({...state, isInjectionDialogShown: false})}/>
            );
        } else {
            return null;
        }
    }

    const renderDeleteConfirmationModal = () => {
        if (!state.requestedSampleForDelete) {
            return null;
        }

        return <Confirm open={true} dimmer="blurring"
                 header="Delete Sample?"
                 content={`Are you sure you want to delete the sample ${displaySample(state.requestedSampleForDelete)}?`}
                 confirmButton="Delete"
                 onCancel={() => setState({...state, requestedSampleForDelete: null})}
                 onConfirm={async () => {
                     await deleteSample({variables: {id: state.requestedSampleForDelete.id}});
                     setState({...state, requestedSampleForDelete: null});
                 }}/>
    }

    const renderInjections = (injections: IInjection[], isExpanded: boolean) => {
        if (!injections || injections.length === 0) {
            return "(none)";
        }

        if (injections.length === 1) {
            return displayInjection(injections[0], 28);
        }

        if (!isExpanded) {
            return `${injections.length} injections`;
        }

        const rows = injections.map(i => (
            <List.Item key={`sil_${i.id}`}>
                {displayInjection(i, 28)}
            </List.Item>)
        );

        return <List>{rows} </List>;
    }

    const onAcceptIdNumberEdit = async (sample: ISample, value: string, updateFn: any) => {
        const idNumber = parseInt(value);

        if (!isNaN(idNumber) && idNumber !== sample.idNumber) {
            await updateFn({variables: {sample: {id: sample.id, idNumber}}});
        }
    }

    const onDateChanged = async (sample: ISample, value: Date, updateFn: any) => {
        if (value !== sample.sampleDate) {
            await updateFn({variables: {sample: {id: sample.id, sampleDate: value.valueOf()}}});
        }
    }

    const onAcceptTagEdit = async (sample: ISample, value: string, updateFn: any) => {
        if (value !== sample.tag) {
            await updateFn({variables: {sample: {id: sample.id, tag: value}}});
        }
    }

    const onAcceptTomographyEdit = async (sample: ISample, value: string, updateFn: any) => {
        if (value !== sample.tag) {
            await updateFn({variables: {sample: {id: sample.id, tomography: value}}});
        }
    }

    const onAcceptAnimalIdEdit = async (sample: ISample, value: string, updateFn: any) => {
        if (value !== sample.animalId) {
            await updateFn({variables: {sample: {id: sample.id, animalId: value}}});
        }
    }

    const onAcceptVisibility = async (sample: ISample, visibility: ShareVisibility, updateFn: any) => {
        if (visibility !== sample.visibility) {
            await updateFn({variables: {sample: {id: sample.id, visibility: visibility}}});
        }
    }

    const onAcceptMouseStrainChange = async (sample: ISample, name: string, updateFn: any) => {
        if ((!sample.mouseStrain || name !== sample.mouseStrain.name) || (!name && sample.mouseStrain)) {
            await updateFn({variables: {sample: {id: sample.id, mouseStrainName: name || null}}});
        }
    }

    const [createSample] = useMutation(CREATE_SAMPLE_MUTATION,
        {
            refetchQueries: ["SamplesQuery"],
            onCompleted: (data) => onSampleCreated(data.createSample),
            onError: (error) => toast.error(toastCreateError(error), {autoClose: false})
        });

    const [updateSample] = useMutation(UPDATE_SAMPLE_MUTATION,
        {
            onCompleted: (data) => onSampleUpdated(data.updateSample),
            onError: (error) => toast.error(toastUpdateError(error), {autoClose: false})
        });

    const [deleteSample] = useMutation(DELETE_SAMPLE_MUTATION,
        {
            refetchQueries: ["SamplesQuery"],
            onError: (error) => toast.error(toastDeleteError(error), {autoClose: false})
        });

    const samples = [...props.samples].sort(
        (a, b) => b.createdAt - a.createdAt)
        .slice(state.offset, state.offset + state.limit);

    const totalCount = props.samples.length;

    const pageCount = Math.ceil(totalCount / state.limit);

    const activePage = (state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1);

    const start = state.offset + 1;
    const end = Math.min(state.offset + state.limit, totalCount);

    const columns = [{
        Header: "Id",
        accessor: "idNumber",
        maxWidth: 40,
        Cell: (row: any) => (
            <InputPopup value={row.value} header={`Sample ${row.original.idNumber} Id`}
                        placeholder="Enter new id..." isValidValueFcn={(val) => !isNaN(parseInt(val))}
                        onAccept={(value) => onAcceptIdNumberEdit(row.original, value, updateSample)}/>
        )
    }, {
        Header: "Acq. Date",
        accessor: "sampleDate",
        maxWidth: 100,
        Cell: (row: any) => (
            <ReactDatePicker
                className="date-picker-input"
                dateFormat="YYYY-MM-DD"
                selected={moment(new Date(row.value))}
                onChange={(d) => onDateChanged(row.original, d.toDate(), updateSample)}
            />
        )
    }, {
        Header: "Tag",
        accessor: "tag",
        Cell: (row: any) => (
            <TextAreaPopup value={row.value} header={`Sample ${row.original.idNumber} Tag`}
                           placeholder="Enter new tag..."
                           onAccept={(value) => onAcceptTagEdit(row.original, value, updateSample)}/>
        )
    }, {
        Header: "Animal",
        accessor: "animalId",
        width: 100,
        Cell: (row: any) => (
            <InputPopup value={row.value} header={`Sample ${row.original.idNumber} Animal Id`}
                        placeholder="Enter animal id..."
                        onAccept={(value) => onAcceptAnimalIdEdit(row.original, value, updateSample)}/>
        ),
    }, {
        Header: "Genotype",
        accessor: "mouseStrain",
        width: 320,
        Cell: (row: any) => (
            <AutoSuggestPopup<IMouseStrain> items={props.mouseStrains}
                                            header={`Sample ${row.original.idNumber} Genotype`}
                                            placeholder="select or name a genotype"
                                            value={row.value ? row.value.name : ""}
                                            onChange={(v: string) => onAcceptMouseStrainChange(row.original, v, updateSample)}/>
        ),
    }, {
        Header: "Injections",
        accessor: "injections",
        maxWidth: 220,
        Cell: (row: any) => (
            <a onClick={() => onRequestManageInjections(row.original)}>
                {renderInjections(row.value, row.isExpanded !== undefined && row.isExpanded !== false)}
            </a>
        )
    }, {
        Header: "Tomography",
        accessor: "tomography",
        maxWidth: 120,
        Cell: (row: any) => (
            <TextAreaPopup value={row.value} header={`Sample ${row.original.idNumber} Tag`}
                           placeholder="Update tomography..."
                           onAccept={(value) => onAcceptTomographyEdit(row.original, value, updateSample)}/>
        )
    }, {
        Header: "Visibility",
        accessor: "visibility",
        maxWidth: 120,
        Cell: (row: any) => (
            <Dropdown search fluid inline options={SampleVisibilityOptions}
                      value={FindVisibilityOption(row.value).value}
                      onChange={(_, {value}) => onAcceptVisibility(row.original, value as ShareVisibility, updateSample)}/>
        )
    }, {
        Header: "",
        accessor: "neuronCount",
        maxWidth: 120,
        Cell: (row: any) => {
            return row.value === 0 ?
                <Button icon="trash" color="red" size="mini" content="delete" labelPosition="left"
                        onClick={() => setState({...state, requestedSampleForDelete: row.original})}/> :
                <Label>{row.value}<Label.Detail>{row.value == 1 ? "neuron" : "neurons"}</Label.Detail></Label>
        }
    }];

    const subComponent = (_: any) => {
        return (
            <div/>
        );
    };

    return (
        <div>
            {renderInjectionsDialog()}
            {renderDeleteConfirmationModal()}
            <Segment.Group>
                <Segment secondary
                         style={{
                             display: "flex",
                             alignItems: "center",
                             justifyContent: "space-between"
                         }}>
                    <Header content="Samples" style={{margin: "0"}}/>
                    <Button content="Add" icon="add" size="tiny" labelPosition="right"
                            color="blue"
                            floated="right"
                            onClick={() => createSample({variables: {sample: {}}})}/>
                </Segment>
                <Segment>
                    <PaginationHeader pageCount={pageCount}
                                      activePage={activePage}
                                      limit={state.limit}
                                      onUpdateLimitForPage={limit => onUpdateLimit(limit)}
                                      onUpdateOffsetForPage={page => onUpdateOffsetForPage(page)}/>
                </Segment>
                <Segment as="div" style={{padding: 0}}>
                    <ReactTable showPagination={false} pageSize={Math.min(totalCount, state.limit)}
                                data={samples}
                                columns={columns}
                                collapseOnDataChange={false}
                                SubComponent={subComponent}
                                sortable={false}
                                resizable={true}
                                getTdProps={(_: any, __: any, column: any) => {
                                    if (column.Header === "Visibility")
                                        return {className: "-menu"};
                                    return {};
                                }}
                    />
                </Segment>
                <Segment secondary style={{display: "flex", justifyContent: "space-between"}}>
                    <div style={{order: 0}}>
                        {totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} samples` : "It's a clean slate - create the first sample!") : ""}
                    </div>
                    <div style={{order: 1}}>
                        <i>Click a value to edit. Expand to view additional injections (if applicable).</i>
                    </div>
                    <div style={{order: 2}}>
                        {`Page ${activePage} of ${pageCount}`}
                    </div>
                </Segment>
            </Segment.Group>
        </div>
    );
}

function onSampleCreated(data: CreateSampleMutationData) {
    if (!data.source || data.error) {
        toast.error(toastCreateError(data.error), {autoClose: false});
    }
}

function onSampleUpdated(data: UpdateSampleMutationData) {
    if (!data.source || data.error) {
        toast.error(toastCreateError(data.error), {autoClose: false});
    }
}
