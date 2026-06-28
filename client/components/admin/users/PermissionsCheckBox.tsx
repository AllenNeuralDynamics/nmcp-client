import React, {useState} from "react";
import {Checkbox, Group, Loader} from "@mantine/core";
import {MutationFunction} from "@apollo/client";

import {UpdatePermissionsResponse, UpdatePermissionsVariables} from "../../../graphql/user";

function calculatePermissions(permissions: number, permission: number, b: boolean): number {
    if (b) {
        return permissions | permission;
    }

    return permissions & ~permission;
}

type PermissionsCheckBoxProps = {
    userId: string;
    updatePermissions: MutationFunction<UpdatePermissionsResponse, UpdatePermissionsVariables>;
    userPermissions: number;
    permission: number;
    disabled?: boolean;
}

export const PermissionsCheckBox = (props: PermissionsCheckBoxProps) => {
    const [loading, setLoading] = useState(false);

    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true);

        Promise.resolve(props.updatePermissions({
            variables: {
                id: props.userId,
                permissions: calculatePermissions(props.userPermissions, props.permission, evt.currentTarget.checked)
            }
        })).catch(() => undefined).finally(() => setLoading(false));
    };

    return (
        <Group gap={6} wrap="nowrap">
            <Checkbox checked={(props.userPermissions & props.permission) != 0} disabled={props.disabled}
                      onChange={onChange}/>
            {/* Reserve the slot (visibility, not conditional render) so toggling the spinner never shifts layout. */}
            <Loader size="xs" style={{visibility: loading ? "visible" : "hidden"}}/>
        </Group>
    );
}
