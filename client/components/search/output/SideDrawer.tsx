import * as React from "react";
import {rem} from "@mantine/core";

// Matches the Mantine Collapse and Accordion default so every expand/collapse on the page moves at the same pace.
const TransitionDuration = "200ms";

export interface SideDrawerProps {
    opened: boolean;
    width: string;
    side: "left" | "right";
    order: number;
    children?: React.ReactNode;
}

// The contents stay mounted at full width and are clipped while the drawer's width animates, so they slide off-screen
// rather than reflow.  Anchoring them to the edge nearest the viewer makes them slide outward.  Visibility transitions
// in a single step that stays "visible" for the whole duration, so the contents are seen while closing and only drop
// out of view and the tab order once the drawer is fully closed.
export const SideDrawer = ({opened, width, side, order, children}: SideDrawerProps) => {
    // Converted the way Mantine converts the contents' w prop, so the two agree whatever the root font size is.
    const drawerWidth = rem(width);

    return (
        <div style={{
            order,
            flexShrink: 0,
            display: "flex",
            justifyContent: side == "left" ? "flex-end" : "flex-start",
            overflow: "hidden",
            width: opened ? drawerWidth : 0,
            visibility: opened ? "visible" : "hidden",
            transition: `width ${TransitionDuration} ease, visibility ${TransitionDuration}`
        }}>
            <div style={{flexShrink: 0, width: drawerWidth, display: "flex"}}>
                {children}
            </div>
        </div>
    );
};
