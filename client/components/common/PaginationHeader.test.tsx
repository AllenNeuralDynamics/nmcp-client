import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";

import {renderWithProviders} from "../../test/render";
import {PaginationHeader} from "./PaginationHeader";

function header(value: number, limit: number) {
    return <PaginationHeader total={5} value={value} limit={limit} itemCount={100} onChange={() => {
    }} onLimitChange={() => {
    }}/>;
}

describe("PaginationHeader", () => {
    it("follows a limit changed by its page", () => {
        const {rerender} = renderWithProviders(header(1, 10));

        expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "10");

        rerender(header(1, 25));

        expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "25");
    });

    it("follows the page it is given in the page-jump text", () => {
        const {rerender} = renderWithProviders(header(1, 10));

        expect(screen.getByPlaceholderText("Page...")).toHaveValue("1");

        rerender(header(3, 10));

        expect(screen.getByPlaceholderText("Page...")).toHaveValue("3");
    });
});
