import {isSomaLocationSet, SomaLocation} from "../models/neuron";

export type CandidatePoint = {
    id: string;
    point: Float32Array;
}

// Atlas microns to the viewer's 10 micron dimensions.
export function toViewerPoint(location: SomaLocation | null | undefined): Float32Array | null {
    if (!isSomaLocationSet(location)) {
        return null;
    }

    return Float32Array.of(location.x / 10, location.y / 10, location.z / 10);
}

// The location query delivers [x, y, z] tuples, while the soma check reads the object shape rows carry, so each tuple is
// converted before it is validated.
export function candidatePoints(ids: string[], locations: (number[] | null)[]): CandidatePoint[] {
    const points: CandidatePoint[] = [];

    locations.forEach((location, idx) => {
        if (location == null || location.length !== 3) {
            return;
        }

        const [x, y, z] = location;

        const point = toViewerPoint({x, y, z});

        if (point) {
            points.push({id: ids[idx], point});
        }
    });

    return points;
}
