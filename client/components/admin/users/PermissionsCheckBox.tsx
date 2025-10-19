import React from "react";
import {Checkbox} from "@mantine/core";

function calculatePermissions(permissions: number, permission: number, b: boolean): number {
    if (b) {
        return permissions | permission;
    }

    return permissions & ~permission;
}

type PermissionsCheckBoxProps = {
    userId: string;
    updatePermissions: any;
    userPermissions: number;
    permission: number;
    disabled?: boolean;
}

export const PermissionsCheckBox = (props: PermissionsCheckBoxProps) => {
    return <Checkbox checked={(props.userPermissions & props.permission) != 0} disabled={props.disabled}
                     onChange={evt =>
                         props.updatePermissions({
                             variables: {
                                 id: props.userId,
                                 permissions: calculatePermissions(props.userPermissions, props.permission, evt.currentTarget.checked)
                             }
                         })}/>

}
