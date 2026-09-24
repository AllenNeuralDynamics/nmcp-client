import * as React from "react";
import {render} from "@testing-library/react";
import {MockedProvider, MockedResponse} from "@apollo/client/testing";
import {colorsTuple, Combobox, createTheme, MantineProvider, Modal, Tooltip} from "@mantine/core";
import {MemoryRouter} from "react-router-dom";

import {UserContext} from "../components/app/UserApp";
import {User} from "../models/user";

const noTransition = {transitionProps: {duration: 0}};

// Zero-duration transitions so tooltips, modals and option lists mount synchronously.  jsdom lays everything out as a
// zero rect, which floating-ui's hide middleware reads as a detached anchor, so hideDetached must be off for any
// Combobox dropdown to be visible.
const testTheme = createTheme({
    // The one app colour a test asserts on: the row selection background.
    colors: {"table-selection": colorsTuple("#e7f5ff")},
    components: {
        Tooltip: Tooltip.extend({defaultProps: noTransition}),
        Modal: Modal.extend({defaultProps: noTransition}),
        Combobox: Combobox.extend({defaultProps: {...noTransition, hideDetached: false}})
    }
});

type ProviderOptions = {
    user?: User;
    mocks?: ReadonlyArray<MockedResponse>;
};

export function Providers({user = null, mocks = [], children}: ProviderOptions & { children: React.ReactNode }) {
    return (
        <MemoryRouter>
            <MockedProvider mocks={mocks}>
                <MantineProvider theme={testTheme}>
                    <UserContext.Provider value={user}>
                        {children}
                    </UserContext.Provider>
                </MantineProvider>
            </MockedProvider>
        </MemoryRouter>
    );
}

export function renderWithProviders(ui: React.ReactElement, options: ProviderOptions = {}) {
    const result = render(<Providers {...options}>{ui}</Providers>);

    return {
        ...result,
        rerender: (next: React.ReactElement) => result.rerender(<Providers {...options}>{next}</Providers>)
    };
}
