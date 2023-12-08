import * as React from "react";

export type FooterProps = {
    totalCount: number;
}

export const Footer = (props: FooterProps) => {
    return (
        <div style={{
            display: "flex",
            order: 1,
            flexDirection: "row",
            verticalAlign: "middle",
            fontSize: "12px",
            position: "fixed",
            color: "#ccc",
            bottom: "0",
            left: "0",
            width: "100%",
            zIndex: 1000,
            backgroundColor: "#2b2b2b",
            height: "40px",
            padding: "10px"
        }}>
            <div style={{verticalAlign: "middle", color: "white", order: 1, flexGrow: 0, flexShrink: 0}}>
                MouseLight Neuron Browser Copyright © 2016 - {(new Date().getFullYear())} Howard Hughes Medical Institute
            </div>
            <div style={{order: 2, flexGrow: 1, flexShrink: 1, marginLeft: "10px"}}/>
            {props.totalCount >= 0 ?
                <div style={{verticalAlign: "middle", color: "white", order: 3, flexGrow: 0, flexShrink: 0}}>{props.totalCount} neurons
                    available</div> : null}

        </div>
    )
};
