import "@testing-library/jest-dom/vitest";
import {afterEach} from "vitest";
import {cleanup} from "@testing-library/react";

// With vitest globals off, Testing Library cannot register its own afterEach cleanup.
afterEach(() => cleanup());

// jsdom lacks these; Mantine's testing guide supplies the same shims.
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {
        },
        removeListener: () => {
        },
        addEventListener: () => {
        },
        removeEventListener: () => {
        },
        dispatchEvent: () => false
    })
});

class ResizeObserver {
    observe() {
    }

    unobserve() {
    }

    disconnect() {
    }
}

window.ResizeObserver = ResizeObserver;

HTMLElement.prototype.scrollIntoView = () => {
};

const {getComputedStyle} = window;
window.getComputedStyle = (element: Element) => getComputedStyle(element);
