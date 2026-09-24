import React from "react";
import {Navigate} from "react-router-dom";

import {UserPermissions} from "../../graphql/user";
import {useUser} from "../../hooks/useUser";
import {hasPermission} from "../../models/user";
import {ReviewReconstructions} from "./ReviewReconstructions";

export const ReviewTab = () => {
    const user = useUser();

    return hasPermission(user?.permissions, UserPermissions.ReviewAll) ? <ReviewReconstructions/> : <Navigate to="/" replace />;
};
