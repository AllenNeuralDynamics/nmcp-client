import gql from "graphql-tag";

import {Point3D, Range2D} from "../util/viewerTypes";

export const TOMOGRAPHY_QUERY = gql`query TomographyQuery {
  tomographyMetadata {
    id
    name
    origin
    pixelSize
    threshold
    limits {
      horizontal
      sagittal
      coronal
    }
  }
}`;

export type ApiTomographyPlaneExtents = {
    horizontal: Range2D;
    sagittal: Range2D;
    coronal: Range2D;
}

export type ApiSampleTomography = {
    id: string;
    name: string;
    origin: Point3D;
    pixelSize: Point3D;
    threshold: Range2D;
    limits: ApiTomographyPlaneExtents;
}

export type TomographyApiResponse = {
    tomographyMetadata: ApiSampleTomography[]
}
