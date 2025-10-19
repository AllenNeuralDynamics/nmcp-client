import React from "react";

import {useUser} from "../../hooks/useUser";
import {UserPermissions} from "../../graphql/user";
import {ReviewReconstructions} from "./ReviewReconstructions";
import {Navigate} from "react-router-dom";

export const ReviewTab = () => {
    const user = useUser();

    const havePeer = user?.permissions & UserPermissions.PeerReview
    const haveFull = user?.permissions & UserPermissions.FullReview;

    return havePeer || haveFull ? <ReviewReconstructions/> : <Navigate to="/" replace />;
};
