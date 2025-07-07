import React from "react";
import {useContext} from "react";

import {UserContext} from "../app/UserApp";
import {UserPermissions} from "../../graphql/user";
import {FullReview} from "./FullReview";
import {PeerReview} from "./PeerReview";

export const Review = () => {
    const user = useContext(UserContext);

    if (user?.permissions & UserPermissions.PeerReview) {
        return (<PeerReview/>);
    } else {
        return (<FullReview/>)
    }
};
