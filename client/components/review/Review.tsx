import React from "react";
import {useContext} from "react";

import {UserContext} from "../app/UserApp";
import {UserPermissions} from "../../graphql/user";
import {FullReview} from "./FullReview";
import {PeerReview} from "./PeerReview";

export const Review = () => {
    const user = useContext(UserContext);
console.log(user)
    console.log(user?.permissions)
    console.log(user?.permissions & UserPermissions.PeerReview)
    const peer = user?.permissions & UserPermissions.PeerReview ? <PeerReview/> : null;

    return (
        <div>
            {peer}
            <FullReview/>
        </div>
    );
};
