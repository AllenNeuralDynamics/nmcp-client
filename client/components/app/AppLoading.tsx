import * as React from "react";

export type AppLoadingProps = {
    message?: string;
}

export const AppLoading = (props: AppLoadingProps) => {
    return (
        <div style={{textAlign: "center", fontSize: "20px", width: "100%"}}>
            <div style={{padding: "20px"}}>
                <div style={spinnerStyle}/>
            </div>
            <div style={{padding: "20px"}}>
                {props.message || "initializing"}
            </div>
        </div>
    );
};

const spinnerStyle = {
    width: 40,
    height: 40,
    border: "2px solid",
    borderColor: "#1e8fc6",
    borderBottomColor: "transparent",
    borderRadius: "100%",
    background: "transparent !important",
    verticalAlign: "middle",
    animation: "spinner 0.75s 0s infinite linear",
    animationFillMode: 'both',
    display: "inline-block"
};
