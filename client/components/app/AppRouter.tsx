import * as React from "react";
import {Route, Routes} from "react-router-dom";

import {Candidates} from "../candidates/Candidates";
import {Reconstructions} from "../reconstructions/Reconstructions";
import {ManageNeurons} from "../neurons/ManageNeurons";
import {Admin} from "../admin/Admin";
import {ReviewTab} from "../review/ReviewTab";
import {NeuronVersions} from "../neurons/versions/NeuronVersions";
import {Home} from "../search/Home";

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/candidates" element={<Candidates/>}/>
            <Route path="/reconstructions" element={<Reconstructions/>}/>
            <Route path="/specimens" element={<ManageNeurons/>}/>
            <Route path="/review" element={<ReviewTab/>}/>
            <Route path="/admin" element={<Admin/>}/>
            <Route path="/neuron/:neuronId/:versionId?" element={<NeuronVersions/>}/>
            <Route path="/" element={<Home/>}/>
        </Routes>
    );
}
