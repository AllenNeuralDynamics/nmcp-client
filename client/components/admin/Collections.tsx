import React, {useState} from "react";
import {useQuery} from "@apollo/react-hooks";
import {Button, Header, Segment, Table, TableCell, TableRow} from "semantic-ui-react";

import {COLLECTIONS_QUERY, CollectionsResponse} from "../../graphql/collections";
import {ICollection} from "../../models/collection";
import {EditCollection} from "./EditCollection";

export const Collections = () => {
    const [state, setState] = useState<ICollection>(null);

    const {loading, error, data} = useQuery<CollectionsResponse>(COLLECTIONS_QUERY, {
        pollInterval: 10000
    });

    if (loading || !data || !data.collections) {
        return (<div/>)
    }

    const onRowClick = (collection: ICollection) => {
        setState(collection);
    };

    const addCollection = () => {
        setState({
            id: null,
            name: "",
            description: "",
            reference: ""
        });
    };

    const afterCreate = () => {
        setState(null);
    }

    const rows = data.collections.map((c: ICollection) => {
        return <CollectionRow collection={c} isSelected={c == state} onClick={onRowClick}/>
    });

    return (
        <div>
            <Segment.Group>
                <Segment secondary style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                    <Header style={{margin: "0"}}>Collections</Header>
                    <Button content="Add" icon="add" size="tiny" labelPosition="right" color="blue" floated="right"
                            onClick={() => addCollection()}/>
                </Segment>
                <Table attached="bottom" compact="very" celled structured selectable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Description</Table.HeaderCell>
                            <Table.HeaderCell>Reference</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                </Table>
            </Segment.Group>

            <EditCollection collection={state} afterCreate={afterCreate}/>
        </div>
    );
}

interface ICollectionRowProps {
    collection: ICollection;
    isSelected: boolean;

    onClick(collection: ICollection): void;
}

const CollectionRow = (props: ICollectionRowProps) => {
    return (
        <TableRow key={`collection_${props.collection.id}`} active={props.isSelected} onClick={() => props.onClick(props.collection)}>
            <TableCell>{props.collection.name}</TableCell>
            <TableCell>{props.collection.description}</TableCell>
            <TableCell>{props.collection.reference}</TableCell>
        </TableRow>
    );
}
