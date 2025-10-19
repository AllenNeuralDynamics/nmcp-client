import * as React from "react";
import { useMsal } from "@azure/msal-react";
import {Button} from "@mantine/core";

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
            <Button variant="light" onClick={() => handleLogin("redirect")} size="small">Sign In</Button>
        </div>
    )
};
