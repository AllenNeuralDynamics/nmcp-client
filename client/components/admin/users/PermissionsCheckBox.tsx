import React, {useState} from "react";
import {Checkbox, Group, Loader} from "@mantine/core";
import {MutationFunction} from "@apollo/client";

import {UpdatePermissionsResponse, UpdatePermissionsVariables} from "../../../graphql/user";

function calculatePermissions(permissions: number, permission: number, exclusiveWith: number, b: boolean): number {
    if (b) {
        return (permissions & ~exclusiveWith) | permission;
    }

    return permissions & ~permission;
}

type PermissionsCheckBoxProps = {
    userId: string;
    updatePermissions: MutationFunction<UpdatePermissionsResponse, UpdatePermissionsVariables>;
    userPermissions: number;
    permission: number;
    // Permissions cleared when this one is granted. Clearing only happens on grant, so a pair of mutually
    // exclusive permissions that arrive both set from the API stays that way until one is turned off.
    exclusiveWith?: number;
    disabled?: boolean;
}

export const PermissionsCheckBox = (props: PermissionsCheckBoxProps) => {
    const [loading, setLoading] = useState(false);

    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true);

        Promise.resolve(props.updatePermissions({
            variables: {
                id: props.userId,
                permissions: calculatePermissions(props.userPermissions, props.permission, props.exclusiveWith ?? 0,
                    evt.currentTarget.checked)
            }
        })).catch(() => undefined).finally(() => setLoading(false));
    };

    return (
        <Group gap={6} wrap="nowrap">
            {/* Mirrors the spinner slot below so the checkbox itself, not the pair, is centred in the cell. */}
            <Loader size="xs" style={{visibility: "hidden"}} aria-hidden/>
            <Checkbox checked={(props.userPermissions & props.permission) != 0} disabled={props.disabled}
                      onChange={onChange}/>
            {/* Reserve the slot (visibility, not conditional render) so toggling the spinner never shifts layout. */}
            <Loader size="xs" style={{visibility: loading ? "visible" : "hidden"}}/>
        </Group>
    );
}
