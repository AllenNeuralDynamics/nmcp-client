import {createContext, useContext} from "react";

import {CandidateFilter} from "../viewmodel/candidateFilter";

const CandidateFilterContext = createContext<CandidateFilter>(new CandidateFilter())

export const useCandidateFilter = () => useContext(CandidateFilterContext);
