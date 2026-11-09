import * as React from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {useIsAuthenticated} from "@azure/msal-react";

import {Home} from "../search/Home";
import {Candidates} from "../candidates/Candidates";
import {Reconstructions} from "../reconstructions/Reconstructions";
import {ReviewTab} from "../review/ReviewTab";
import {ManageNeurons} from "../neurons/ManageNeurons";
import {Admin} from "../admin/Admin";
import {Specimen} from "../specimens/Specimen";
import {Neuron} from "../neurons/Neuron";
import {Support} from "../support/Support";

// Replaces the history entry so a signed-out visit to a restricted route leaves no trace to navigate back to.
const RequireAuthentication = ({children}: { children: React.ReactElement }) => {
    return useIsAuthenticated() ? children : <Navigate to="/" replace/>;
}

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/candidates" element={<Candidates/>}/>
            <Route path="/reconstructions" element={<RequireAuthentication><Reconstructions/></RequireAuthentication>}/>
            <Route path="/specimens" element={<RequireAuthentication><ManageNeurons/></RequireAuthentication>}/>
            <Route path="/review" element={<RequireAuthentication><ReviewTab/></RequireAuthentication>}/>
            <Route path="/admin" element={<RequireAuthentication><Admin/></RequireAuthentication>}/>
            <Route path="/neuron/:neuronId/:versionId?" element={<Neuron/>}/>
            <Route path="/specimen/:specimenId?" element={<Specimen/>}/>
            <Route path="/support" element={<Support/>}/>
            <Route path="/" element={<Home/>}/>
        </Routes>
    );
}
