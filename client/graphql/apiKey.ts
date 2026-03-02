import gql from "graphql-tag";

export type ApiKeyShape = {
    id: string;
    description: string;
    expiration: string;
    createdAt: string;
}

const API_KEY_FIELDS_FRAGMENT = gql`fragment ApiKeyFields on ApiKey {
    id
    description
    expiration
    createdAt
}`;

export const API_KEYS_QUERY = gql`
    query ApiKeysQuery {
        apiKeys {
            ...ApiKeyFields
        }
    }
    ${API_KEY_FIELDS_FRAGMENT}
`;

export type ApiKeysResponse = {
    apiKeys: ApiKeyShape[];
}

export const CREATE_API_KEY_MUTATION = gql`mutation CreateApiKey($key: String!, $description: String, $durationDays: Int) {
    createApiKey(key: $key, description: $description, durationDays: $durationDays) {
        ...ApiKeyFields
    }
}
${API_KEY_FIELDS_FRAGMENT}
`;

export type CreateApiKeyVariables = {
    key: string;
    description: string;
    durationDays: number;
}

export type CreateApiKeyResponse = {
    createApiKey: ApiKeyShape;
}

export const DELETE_API_KEY_MUTATION = gql`mutation DeleteApiKey($id: String!) {
    deleteApiKey(id: $id)
}
`;

export type DeleteApiKeyVariables = {
    id: string;
}

export type DeleteApiKeyResponse = {
    deleteApiKey: boolean;
}
