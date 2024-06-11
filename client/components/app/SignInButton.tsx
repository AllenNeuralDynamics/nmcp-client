import * as React from "react";
import {Button} from "semantic-ui-react";
import { useMsal } from "@azure/msal-react";

import { loginRequest } from "../../authConfig";

export const SignInButton = () => {
    const { instance } = useMsal();

    const handleLogin = async (loginType: string) => {

        if (loginType === "popup") {
            await instance.loginPopup(loginRequest);
        } else if (loginType === "redirect") {
            await instance.loginRedirect(loginRequest);
        }
    }

    return (
        <div>
            <Button content="Sign In" onClick={() => handleLogin("redirect")} icon='sign-in' labelPosition='right' size="small" color="blue"/>
        </div>
    )
};
