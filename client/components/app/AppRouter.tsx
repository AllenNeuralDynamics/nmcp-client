import * as React from "react";
import {Route, Routes} from "react-router-dom";

import {AppContent} from "./AppContent";
import {Candidates} from "../candidates/Candidates";
import {Reconstructions} from "../reconstructions/Reconstructions";
import {Samples} from "../neurons/samples/Samples";
import {Admin} from "../admin/Admin";
import {Review} from "../review/Review";

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/candidates" element={<Candidates/>}/>
            <Route path="/reconstructions" element={<Reconstructions/>}/>
            <Route path="/samples" element={<Samples/>}/>
            <Route path="/review" element={<Review/>}/>
            <Route path="/admin" element={<Admin/>}/>
            <Route path="/" element={<AppContent/>}/>
        </Routes>
    );
}
