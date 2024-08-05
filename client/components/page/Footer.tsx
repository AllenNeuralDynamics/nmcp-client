import * as React from "react";
import {useContext} from "react";

import {ConstantsContext} from "../app/AppConstants";
import {useLoadSystemConfiguration} from "../../hooks/useLoadSystemConfiguration";
import {useStore} from "../app/App";

export const Footer = () => {
    const constants = useContext(ConstantsContext)

    const  {SystemConfiguration} = useStore();

    let totalMessage = "There are no reconstructions available";

    if (constants.NeuronCount > 0) {
        if (constants.NeuronCount > 1) {
            totalMessage = `There are ${constants.NeuronCount} reconstructions available`
        } else {
            totalMessage = `There is 1 reconstruction available`
        }
    }

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
                Neuron Morphology Community Portal Copyright © 2023 - {(new Date().getFullYear())} Allen Institute
            </div>
            <div style={{order: 2, flexGrow: 1, flexShrink: 1, marginLeft: "10px"}}/>
            <div style={{verticalAlign: "middle", color: "white", order: 3, flexGrow: 0, flexShrink: 0}}>{totalMessage}</div>
        </div>
    )
};
