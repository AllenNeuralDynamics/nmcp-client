import * as React from "react";
import * as ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import {AuthenticationResult, EventMessage, EventType, PublicClientApplication} from "@azure/msal-browser";

import {App} from "./components/app/App";
import {msalConfig} from "./authConfig";

import "rc-slider/assets/index.css";
import "../assets/style.css";

require("file-loader?name=index.html!../index.html");

import "neuroglancer/layer/enabled_frontend_modules.js";
import "neuroglancer/datasource/enabled_frontend_modules.js";
import {MsalProvider} from "@azure/msal-react";

const msalInstance = new PublicClientApplication(msalConfig);

try {
// Default to using the first account if no account is active on page load
    if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
        // Account selection logic is app dependent. Adjust as needed for different use cases.
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
    }
    msalInstance.addEventCallback((event: EventMessage) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
            const payload = event.payload as AuthenticationResult;
            const account = payload.account;
            msalInstance.setActiveAccount(account);
        }
    });
} catch (err) {
    console.log(err);
}

const rootEl = document.getElementById("root");

ReactDOM.render(
    <BrowserRouter>
        <MsalProvider instance={msalInstance}>
            <App/>
        </MsalProvider>
    </BrowserRouter>,
    rootEl
);
