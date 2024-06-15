import * as React from "react";
import {useContext} from "react";

import {ConstantsContext} from "../app/AppConstants";

export const Footer = () => {
    const constants = useContext(ConstantsContext)

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
                Neuron Morphology Community Portal Copyright © 2023 - {(new Date().getFullYear())} Allen Institute (v{constants.ApiVersion})
            </div>
            <div style={{order: 2, flexGrow: 1, flexShrink: 1, marginLeft: "10px"}}/>
            {constants.NeuronCount >= 0 ?
                <div style={{verticalAlign: "middle", color: "white", order: 3, flexGrow: 0, flexShrink: 0}}>{constants.NeuronCount} reconstructions
                    available</div> : null}

        </div>
    )
};
