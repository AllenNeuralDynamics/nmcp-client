import * as React from "react";
import {useMsal} from "@azure/msal-react";
import {Avatar, Menu} from "@mantine/core";
import {IconLogout2, IconSettings} from "@tabler/icons-react";
import {useAppLayout} from "../../hooks/useAppLayout";

export const SignOutButton = () => {
    const {instance} = useMsal();
    const appLayout = useAppLayout();

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

    if (!instance.getActiveAccount()){
        return null;
    }

    return (
        <Menu>
            <Menu.Target>
                <Avatar variant="filled" key={instance.getActiveAccount().username} name={instance.getActiveAccount().name} color="blue"/>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item leftSection={<IconSettings size={18}/>} onClick={() => appLayout.openSettingsDialog()}>
                    Preferences
                </Menu.Item>
                <Menu.Divider/>
                <Menu.Item leftSection={<IconLogout2 size={18}/>} onClick={() => handleLogout("redirect")}>
                    Sign Out
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    )
};
