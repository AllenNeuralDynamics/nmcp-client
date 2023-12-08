import {Range2D} from "../util/viewerTypes";

export enum SlicePlane {
    Undefined = 0,
    Sagittal,
    Horizontal,
    Coronal
}

export type SliceRequest = {
    id?: string;
    plane?: number;
    location?: number;
    threshold?: Range2D;
    mask?: boolean;
    invert?: boolean;
}

export type SliceResponse = {
    sampleId: string;
    image: HTMLImageElement;
    mask: HTMLImageElement;
}

export class SliceService {
    public async requestSlice(request: SliceRequest): Promise<SliceResponse | null> {
        const resp = await fetch("/slice", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(request)
        });

        try {
            if (resp.status !== 200) {
                errorResponse(request.id);
            }
            const json = await resp.json();

            const image = new Image();
            image.src = 'data:image/png;base64,' + json.texture;

            const mask = new Image();
            mask.src = 'data:image/png;base64,' + json.mask;

            return {
                sampleId: request.id,
                image,
                mask
            }
        } catch {
            return errorResponse(request.id);
        }
    }
}

const errorResponse = (id: string): SliceResponse => ({
    sampleId: id,
    image: null,
    mask: null
});
