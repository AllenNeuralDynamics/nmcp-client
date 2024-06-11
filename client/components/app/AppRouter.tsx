import {Route, Switch} from "react-router-dom";
import * as React from "react";
import {useQuery} from "@apollo/react-hooks";

// import {AppQueryQueryResponse} from "../../graphql/app";
// import {CANDIDATE_NEURONS_FOR_REVIEW_QUERY, CandidateNeuronsForReviewQueryResponse} from "../../graphql/neurons";
import {AppContent} from "./AppContent";
import {Candidates} from "../candidates/Candidates";
// import {Reconstructions} from "../reconstructions/Reconstructions";
// import {Samples} from "../samples/Samples";
// import {Review} from "../Review";
import {Admin} from "../admin/Admin";
import {CANDIDATE_NEURONS_FOR_REVIEW_QUERY, CandidateNeuronsForReviewQueryResponse} from "../../graphql/candidates";
import {Reconstructions} from "../reconstructions/Reconstructions";

interface IAppRouterProps {
    // data: AppQueryQueryResponse;
}

export const AppRouter = (props: IAppRouterProps) => {
    let shouldClearCreateContentsAfterUpload = true;

    if (typeof (Storage) !== "undefined") {
        shouldClearCreateContentsAfterUpload = localStorage.getItem("shouldClearCreateContentsAfterUpload") === "true";
    }

    // TODO This should be in CreateTracing, however it is still class based and cannot use useQuery
    const {loading, error, data} = useQuery<CandidateNeuronsForReviewQueryResponse>(CANDIDATE_NEURONS_FOR_REVIEW_QUERY);

    if (loading) {
        return (<div/>)
    }

    return (
        <Switch>
            <Route path="/candidates" render={() => (<Candidates/>)}/>
            <Route path="/reconstructions" render={() => (<Reconstructions/>)}/>
            {/*
            <Route path="/samples" render={() => (<Samples samples={props.data.samples.items}/>)}/>
            <Route path="/review" render={() => (<Review neurons={data.candidatesForReview} tracingStructures={props.data.tracingStructures}
                                                         shouldClearCreateContentsAfterUpload={shouldClearCreateContentsAfterUpload}/>)}/>
            */}
            <Route path="/admin" render={() => (<Admin/>)}/>
            <Route path="/" render={() => (<AppContent/>)}/>
        </Switch>
    );
}
