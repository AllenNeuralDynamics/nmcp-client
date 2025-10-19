import {Configuration, PopupRequest} from "@azure/msal-browser";

import {LogLevel} from "@azure/msal-browser";

const prod = {
    apiId: "3833203f-8f50-4947-a7e6-8652fa9a4ad2",
    clientId: "87782f13-d218-414f-94f8-98c85ed0ce9f",
    authorityId: "32669cd6-737f-4b39-8bdd-d6951120d3fc"
};

const staging = {
    apiId: "b57728c9-e252-45ca-aeb6-8d6a98a52bde",
    clientId: "cfbf816e-513d-4a41-b0cc-97effee5d823",
    authorityId: "32669cd6-737f-4b39-8bdd-d6951120d3fc"
};

const dev = {
    apiId: "e00cfdc4-11cc-4daa-88cc-370a594042e2",
    clientId: "c000a1f2-631b-4e9e-a877-57407be18d9d",
    authorityId: "b8b2bd89-9ec5-414c-91fa-c1258d18559b"
};

const source = process.env.AUTH_ENV == "production" ? prod : (process.env.AUTH_ENV == "staging" ? staging : dev);

const scopes = ["User.Read", `api://${source.apiId}/internal.read`, `api://${source.apiId}/internal.read`];

const auth = {
    clientId: source.clientId,
    authority: `https://login.microsoftonline.com/${source.authorityId}`,
    redirectUri: '/',
    postLogoutRedirectUri: '/'
};

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
    auth,
    cache: {
        cacheLocation: "localStorage", // "sessionStorage" is more secure, but "localStorage" gives SSO between tabs.
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            logLevel: LogLevel.Warning,
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    }
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest: PopupRequest = {
    scopes
};
