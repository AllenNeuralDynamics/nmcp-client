import {NdbConstants} from "../models/constants";
import {SegmentColorHash} from "../../../nmcp-neuroglancer/dist/package/lib/segment_color";
import {Uint64} from "../../../nmcp-neuroglancer/dist/package/lib/util/uint64";

let colorMap = null;

export function getSegmentColorMap() {
    if (colorMap == null) {
        colorMap = {};

        NdbConstants.DefaultConstants.BrainAreas.map(b => {
            if (b.geometryEnable) {
                colorMap[b.structureId.toString()] = "#" + b.geometryColor;
            }
        });
    }

    return colorMap;
}

let neuronColorTable = null;

export function getNeuronColorTable() {
    if (neuronColorTable == null) {
        neuronColorTable = [];
        const segmentHash = new SegmentColorHash(0);

        for (let idx = 0; idx < 256; idx++) {
            neuronColorTable.push(segmentHash.computeCssColor(Uint64.random()))
        }
    }

    return neuronColorTable;
}

export const jet = [
    "#0050FF",
    "#FF0000",
    "#9FFF60",
    "#00EFFF",
    "#FFEF00",
    "#0000CF",
    "#9F0000",
    "#0080FF",
    "#DFFF20",
    "#FF7000",
    "#0070FF",
    "#FFFF00",
    "#00008F",
    "#CFFF30",
    "#FFAF00",
    "#FF3000",
    "#009FFF",
    "#DF0000",
    "#10FFEF",
    "#0030FF",
    "#70FF8F",
    "#00009F",
    "#AF0000",
    "#00BFFF",
    "#FF9F00",
    "#008FFF",
    "#FF4000",
    "#800000",
    "#0000DF",
    "#50FFAF",
    "#FF2000",
    "#0040FF",
    "#80FF80",
    "#FF1000",
    "#00AFFF",
    "#0000EF",
    "#FF8F00",
    "#CF0000",
    "#30FFCF",
    "#FFDF00",
    "#0000FF",
    "#BFFF40",
    "#EF0000",
    "#20FFDF",
    "#FF5000",
    "#0010FF",
    "#FFBF00",
    "#8FFF70",
    "#8F0000",
    "#00FFFF",
    "#AFFF50",
    "#00DFFF",
    "#0000AF",
    "#FF6000",
    "#FFCF00",
    "#0020FF",
    "#40FFBF",
    "#BF0000",
    "#00CFFF",
    "#FF8000",
    "#0000BF",
    "#60FF9F",
    "#0060FF",
    "#EFFF10"
];
