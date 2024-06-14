import * as React from "react";
import {useState} from "react";
import {Header, Segment} from "semantic-ui-react";

import {IReconstruction} from "../../models/reconstruction";
import {ReviewTable} from "./ReviewTable";
import {SelectedReconstruction} from "./SelectedReconstruction";
import {useQuery} from "@apollo/react-hooks";
import {REVIEWABLE_ANNOTATIONS_QUERY, ReviewableAnnotationsResponse} from "../../graphql/reconstruction";

export const Review = () => {
    const [state, setState] = useState<IReconstruction>(null);

    const {loading, error, data} = useQuery<ReviewableAnnotationsResponse>(REVIEWABLE_ANNOTATIONS_QUERY);

    if (loading) {
        return (<div/>)
    }

    const totalCount = data.reviewableReconstructions.length;

    const onRowClick = (reconstruction: IReconstruction) => {
        setState(reconstruction);
    }

    return (
        <div style={{margin: "20px"}}>
            <Segment.Group>
                <Segment secondary>
                    <Header style={{margin: "0"}}>Reconstructions Submitted for Review</Header>
                </Segment>
                <ReviewTable reconstructions={data.reviewableReconstructions} selected={state} onRowClick={onRowClick}/>
            </Segment.Group>

            {totalCount > 0 ? <SelectedReconstruction reconstruction={state}/> : null}
        </div>
    );
}
