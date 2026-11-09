import * as React from "react";

// Controls where Enter already does something: activating a button or link, a new line in a text area, or choosing
// from a dropdown.  Mantine's dropdowns leave Enter unhandled when no option is highlighted (after typing a search, say)
// and mark open ones only with an internal data attribute, so they are skipped whether open or not.  Matched on the
// focused element only, since the panel's header inputs sit inside the accordion's control, itself a button.
const HandlesOwnEnter = "button, a[href], textarea, [role='button'], [aria-haspopup='listbox']";

export function isSearchEnterKey(event: React.KeyboardEvent): boolean {
    // keyCode 229 is how Safari reports a key that finishes an IME composition, where isComposing is already false.
    if (event.key !== "Enter" || event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229) {
        return false;
    }

    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return false;
    }

    const target = event.target;

    return target instanceof Element && !target.matches(HandlesOwnEnter);
}
