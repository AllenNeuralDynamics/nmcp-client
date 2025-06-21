import * as React from "react";
import {useContext} from "react";

import {ConstantsContext} from "../app/AppConstants";
import {useLoadSystemConfiguration} from "../../hooks/useLoadSystemConfiguration";
import {useStore} from "../app/App";
import {Card, Popup} from "semantic-ui-react";
import {formatHortaLocation} from "../../models/neuron";
import {toast} from "react-toastify";

export const Footer = () => {
    const constants = useContext(ConstantsContext)

    const {SystemConfiguration} = useStore();

    let totalMessage = "There are no reconstructions available";

    if (constants.NeuronCount > 0) {
        if (constants.NeuronCount > 1) {
            totalMessage = `There are ${constants.NeuronCount} reconstructions available`
        } else {
            totalMessage = `There is 1 reconstruction available`
        }
    }

    const citationText = `Allen Institute for Neural Dynamics. (${(new Date().getFullYear())}). Whole brain single neuron reconstructions. Available from: https://morphology.allenneuraldynamics.org.`

    const citation = (<span style={{textDecoration: "underline"}} onClick={async () => {
        await navigator.clipboard.writeText(citationText);
        toast.success("Citation copied to clipboard", {autoClose: 1000, position: "bottom-right"});
    }}>citation</span>);

    const content = (
        <div>
            <p style={{fontSize: "smaller"}}>
                If you use this data, please cite it as (click "citation" below copy to clipboard):
            </p>
            <p style={{marginLeft: "16px", marginRight: "16px", fontStyle: "italic"}}>
                {citationText}
            </p>
            <p style={{fontSize: "x-small", color:"darkgray"}}>
                Data available under <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. You are welcome to use, share, and adapt the data,
                provided that appropriate credit is given by including the citation above. For more detail and examples, see
                https://alleninstitute.org/citation-policy/.
            </p>
        </div>
    )

    const reportWithPopup = <Popup style={{minWidth: "600px"}} content={content} trigger={citation}/>

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
            <div style={{verticalAlign: "middle", color: "white", order: 3, flexGrow: 0, flexShrink: 0}}>
                Data available under <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Free to use with {reportWithPopup}.
            </div>
            <div style={{order: 4, flexGrow: 1, flexShrink: 1, marginLeft: "10px"}}/>
            <div style={{verticalAlign: "middle", color: "white", order: 5, flexGrow: 0, flexShrink: 0}}>{totalMessage}</div>
        </div>
    )
};
