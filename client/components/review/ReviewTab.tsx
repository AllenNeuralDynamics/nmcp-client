import React from "react";
import {Navigate} from "react-router-dom";

import {UserPermissions} from "../../graphql/user";
import {useUser} from "../../hooks/useUser";
import {ReviewReconstructions} from "./ReviewReconstructions";

export const ReviewTab = () => {
    const user = useUser();

    const havePeer = user?.permissions & UserPermissions.PeerReview
    const haveFull = user?.permissions & UserPermissions.FullReview;

    return havePeer || haveFull ? <ReviewReconstructions/> : <Navigate to="/" replace />;
};
