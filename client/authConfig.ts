import { Configuration, PopupRequest } from "@azure/msal-browser";

import { LogLevel } from "@azure/msal-browser";

export const b2cPolicies = {
    names: {
        signUpSignIn: 'B2C_1_susi',
        forgotPassword: 'B2C_1_reset',
        editProfile: 'B2C_1_edit',
    },
    authorities: {
        signUpSignIn: {
            authority: 'https://leapnmcp.b2clogin.com/leapnmcp.onmicrosoft.com/b2c_1_susi',
        },
        forgotPassword: {
            authority: 'https://leapnmcp.b2clogin.com/leapnmcp.onmicrosoft.com/B2C_1_reset',
        },
        editProfile: {
            authority: 'https://leapnmcp.b2clogin.com/leapnmcp.onmicrosoft.com/b2c_1_edit',
        },
    },
    authorityDomain: 'leapnmcp.b2clogin.com',
};

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
    auth: {
        clientId: "821f088d-c442-4590-92b5-4da06f6512b2",
        authority: b2cPolicies.authorities.signUpSignIn.authority,
        knownAuthorities: [b2cPolicies.authorityDomain], // Mark your B2C tenant's domain as trusted.
        redirectUri: "/",
        postLogoutRedirectUri: "/",
        navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
    },
    cache: {
        cacheLocation: 'sessionStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
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
    scopes: ["https://leapnmcp.onmicrosoft.com/4d4a7fd8-6ee6-461a-a4c6-9b4e5157dcdb/internal.read", "https://leapnmcp.onmicrosoft.com/4d4a7fd8-6ee6-461a-a4c6-9b4e5157dcdb/internal.write"]
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
    graphMeEndpoint: "https://localhost:8100/graphql"
};
