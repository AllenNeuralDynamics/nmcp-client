import * as React from "react";
import {Route, Routes} from "react-router-dom";

import {Home} from "../search/Home";
import {Candidates} from "../candidates/Candidates";
import {Reconstructions} from "../reconstructions/Reconstructions";
import {ReviewTab} from "../review/ReviewTab";
import {ManageNeurons} from "../neurons/ManageNeurons";
import {Admin} from "../admin/Admin";
import {Specimen} from "../specimens/Specimen";
import {Neuron} from "../neurons/Neuron";

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/candidates" element={<Candidates/>}/>
            <Route path="/reconstructions" element={<Reconstructions/>}/>
            <Route path="/specimens" element={<ManageNeurons/>}/>
            <Route path="/review" element={<ReviewTab/>}/>
            <Route path="/admin" element={<Admin/>}/>
            <Route path="/neuron/:neuronId/:versionId?" element={<Neuron/>}/>
            <Route path="/specimen/:specimenId?" element={<Specimen/>}/>
            <Route path="/" element={<Home/>}/>
        </Routes>
    );
}
