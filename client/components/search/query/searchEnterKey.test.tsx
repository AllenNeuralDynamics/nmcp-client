import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {fireEvent, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Accordion, Button, Checkbox, MultiSelect, Select, TextInput} from "@mantine/core";

import {isSearchEnterKey} from "./searchEnterKey";
import {renderWithProviders} from "../../../test/render";

function renderPanel() {
    const onSearch = vi.fn();
    const onButton = vi.fn();
    const onSelect = vi.fn();

    renderWithProviders(
        <Accordion value="query" onKeyDown={event => isSearchEnterKey(event) && onSearch()}>
            <Accordion.Item value="query">
                <Accordion.Control>
                    <TextInput label="Header input"/>
                </Accordion.Control>
                <Accordion.Panel>
                    <TextInput label="Amount"/>
                    <Checkbox label="Exact match"/>
                    <Button onClick={onButton}>Add Filter</Button>
                    <Select label="Neuron Structure" data={["Axon", "Dendrite"]} onChange={onSelect}/>
                    <MultiSelect label="Structures" searchable data={["Thalamus", "Cortex"]}/>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );

    return {onSearch, onButton, onSelect};
}

describe("isSearchEnterKey", () => {
    it("searches on Enter in a text input or checkbox", async () => {
        const {onSearch} = renderPanel();

        await userEvent.type(screen.getByRole("textbox", {name: "Amount"}), "5{Enter}");
        await userEvent.type(screen.getByRole("checkbox", {name: "Exact match"}), "{Enter}");

        expect(onSearch).toHaveBeenCalledTimes(2);
    });

    it("searches from an input inside the accordion control, which is itself a button", async () => {
        const {onSearch} = renderPanel();

        await userEvent.type(screen.getByRole("textbox", {name: "Header input"}), "{Enter}");

        expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it("leaves Enter on a button to the button", async () => {
        const {onSearch, onButton} = renderPanel();

        screen.getByRole("button", {name: "Add Filter"}).focus();
        await userEvent.keyboard("{Enter}");

        expect(onButton).toHaveBeenCalledTimes(1);
        expect(onSearch).not.toHaveBeenCalled();
    });

    it("leaves Enter to a dropdown, open or closed", async () => {
        const {onSearch, onSelect} = renderPanel();

        await userEvent.click(screen.getByRole("textbox", {name: "Neuron Structure"}));
        await userEvent.keyboard("{ArrowDown}{Enter}");
        await userEvent.keyboard("{Enter}");

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSearch).not.toHaveBeenCalled();
    });

    it("leaves Enter to a searchable dropdown with no option highlighted", async () => {
        const {onSearch} = renderPanel();

        await userEvent.type(screen.getByRole("textbox", {name: "Structures"}), "Thal{Enter}");
        await userEvent.keyboard("{Escape}{Enter}");

        expect(onSearch).not.toHaveBeenCalled();
    });

    it("ignores modified Enter, other keys and IME composition", async () => {
        const {onSearch} = renderPanel();
        const input = screen.getByRole("textbox", {name: "Amount"});

        await userEvent.type(input, "{Shift>}{Enter}{/Shift}{Control>}{Enter}{/Control}{Meta>}{Enter}{/Meta}{Alt>}{Enter}{/Alt}a");
        fireEvent.keyDown(input, {key: "Enter", isComposing: true});
        fireEvent.keyDown(input, {key: "Enter", keyCode: 229});

        expect(onSearch).not.toHaveBeenCalled();
    });
});
