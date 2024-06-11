import * as React from "react";
import {useMsal} from "@azure/msal-react";
import {Button, Label} from "semantic-ui-react";

export const SignOutButton = () => {
    const {instance} = useMsal();

    const handleLogout = async (logoutType: string) => {
        localStorage.setItem("token", null);

        if (logoutType === "popup") {
            await instance.logoutPopup({
                mainWindowRedirectUri: "/"
            });
        } else if (logoutType === "redirect") {
            await instance.logoutRedirect();
        }
    }

    return (
        <div>
            <Button as="div" onClick={() => handleLogout("redirect")} labelPosition='left'>
                <Label as="a" basic pointing='right'>
                    {instance.getActiveAccount() ? instance.getActiveAccount().username : ""}
                </Label>
                <Button color="blue">
                    Sign Out
                </Button>
            </Button>
        </div>
    )
};
