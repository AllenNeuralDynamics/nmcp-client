import gql from "graphql-tag";
import {IMouseStrain} from "../models/mouseStrain";

export const MOUSE_STRAINS_QUERY = gql`query MouseStrains {
    mouseStrains {
        id
        name
    }
}`;

export type MouseStrainsQueryResponse = {
    mouseStrains: IMouseStrain[];
}
