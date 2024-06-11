import * as React from "react";
import {Header, Segment} from "semantic-ui-react";

import {ReviewTable} from "./ReviewTable";
import {CreateTracing, ICreateTracingProps} from "./create/CreateTracing";

export const Review = (props: ICreateTracingProps) => {
    return (
        <div style={{margin: "20px"}}>
            <Segment.Group>
                <Segment secondary>
                    <Header style={{margin: "0"}}>Review</Header>
                </Segment>
                <ReviewTable/>
            </Segment.Group>

            <CreateTracing neurons={props.neurons} tracingStructures={props.tracingStructures}
                           shouldClearCreateContentsAfterUpload={props.shouldClearCreateContentsAfterUpload}/>
        </div>
    );
}
