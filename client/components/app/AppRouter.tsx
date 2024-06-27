import {Route, Switch} from "react-router-dom";
import * as React from "react";
import {useQuery} from "@apollo/react-hooks";

import {CANDIDATE_NEURONS_FOR_REVIEW_QUERY, CandidateNeuronsForReviewQueryResponse} from "../../graphql/candidates";
import {AppContent} from "./AppContent";
import {Candidates} from "../candidates/Candidates";
import {Reconstructions} from "../reconstructions/Reconstructions";
import {Samples} from "../samples/Samples";
import {Admin} from "../admin/Admin";
import {Review} from "../review/Review";

export const AppRouter = () => {
    // TODO This should be in CreateTracing, however it is still class based and cannot use useQuery
    const {loading, error, data} = useQuery<CandidateNeuronsForReviewQueryResponse>(CANDIDATE_NEURONS_FOR_REVIEW_QUERY);

    if (loading) {
        return (<div/>)
    }

    return (
        <Switch>
            <Route path="/candidates" render={() => (<Candidates/>)}/>
            <Route path="/reconstructions" render={() => (<Reconstructions/>)}/>
            <Route path="/samples" render={() => (<Samples/>)}/>
            <Route path="/review" render={() => (<Review/>)}/>
            <Route path="/admin" render={() => (<Admin/>)}/>
            <Route path="/" render={() => (<AppContent/>)}/>
        </Switch>
    );
}
