import * as React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {colorsTuple, createTheme, DEFAULT_THEME, MantineProvider, mergeMantineTheme, virtualColor} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {MsalProvider} from "@azure/msal-react";
import {AuthenticationResult, EventMessage, EventType, PublicClientApplication} from "@azure/msal-browser";

import {msalConfig} from "./authConfig";
import {ApolloApp} from "./components/app/ApolloApp";

require("file-loader?name=index.html!../index.html");

import "../assets/style.css";

import "neuroglancer/unstable/layer/enabled_frontend_modules.js";
import "neuroglancer/unstable/datasource/enabled_frontend_modules.js";

import "@mantine/core/styles.css";
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';

const viewerBackgroundLightSource = [249, 250, 251];
const viewerBackgroundDarkSource = [42, 42, 42];

export const viewerBackgroundLight = viewerBackgroundLightSource.map(v => v / 255.0);
export const viewerBackgroundDark = viewerBackgroundDarkSource.map(v => v / 255.0);

export const viewerBackgroundLightString = `rgb(${viewerBackgroundLightSource.map(v => `${v}`).join(",")})`;
export const viewerBackgroundDarkString = `rgb(${viewerBackgroundDarkSource.map(v => `${v}`).join(",")})`;

const colorPalette = {
    "segment-light": colorsTuple("#eeeeee"),
    "segment-dark": colorsTuple("#343536"),
    "section-light": colorsTuple("#dddddd"),
    "section-dark": colorsTuple("#343536"),
    "table-light": colorsTuple("#f3f4f5"),
    "table-dark": colorsTuple("#1a1a1a"),
    "table-header-light": colorsTuple(viewerBackgroundLightString),
    "table-header-dark": colorsTuple(viewerBackgroundDarkString),
    "table-selection-light": colorsTuple("#e7f5ff"),
    // "table-selection-dark": colorsTuple("#2d2e2f"),
    "table-selection-dark": colorsTuple("#1864ab"),
    "warning-bg-light": colorsTuple("#fff9db"),
    "warning-bg-dark": colorsTuple("#ffd43b"),
    "warning-c-light": colorsTuple("#ffd43b"),
    "warning-c-dark": colorsTuple("#ffd43b"),
    "warning-light": colorsTuple("#f08c00"),
    "warning-dark": colorsTuple("#ffe066"),
    "ngtop-light": colorsTuple("#828282"),
    "ngtop-dark": colorsTuple("#343536"),
    // "table-cell-warning-dark": colorsTuple("#ffd43b")
}

const portalTheme = createTheme({
    white: "#f3f4f5",
    colors: {
        ...colorPalette,
        "segment": virtualColor({
            name: "segment",
            light: "segment-light",
            dark: "segment-dark"
        }),
        "section": virtualColor({
            name: "section",
            light: "section-light",
            dark: "section-dark"
        }),
        "table": virtualColor({
            name: "table",
            light: "table-light",
            dark: "table-dark"
        }),
        "table-header": virtualColor({
            name: "table-header",
            light: "table-header-light",
            dark: "table-header-dark"
        }),
        "table-selection": virtualColor({
            name: "table-selection",
            light: "table-selection-light",
            dark: "table-selection-dark"
        }),
        "warning-bg": virtualColor({
            name: "warning-bg",
            light: "warning-bg-light",
            dark: "warning-bg-dark"
        }),
        "warning-c": virtualColor({
            name: "warning-c",
            light: "warning-c-light",
            dark: "warning-c-dark"
        }),
        "warning": virtualColor({
            name: "warning",
            light: "warning-light",
            dark: "warning-dark"
        }),
        "ngtop": virtualColor({
            name: "ngtop",
            light: "ngtop-light",
            dark: "ngtop-dark"
        })
    }
});

const theme = mergeMantineTheme(DEFAULT_THEME, portalTheme);

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

const root = createRoot(rootEl);

root.render(
    <BrowserRouter>
        <MantineProvider theme={theme}>
            <Notifications zIndex={1000}/>
            <MsalProvider instance={msalInstance}>
                <ApolloApp/>
            </MsalProvider>
        </MantineProvider>
    </BrowserRouter>
);
