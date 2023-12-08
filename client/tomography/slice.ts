import * as THREE from "three";
import {SliceResponse, SlicePlane} from "../services/sliceService";
import {CoronalLimit, HorizontalLimit, SagittalLimit, TomographyConstants} from "./tomographyConstants";

type SliceSize = [number, number];

const SliceSizeMap = new Map<SlicePlane, SliceSize>();

SliceSizeMap.set(SlicePlane.Sagittal, [CoronalLimit, HorizontalLimit]);
SliceSizeMap.set(SlicePlane.Horizontal, [SagittalLimit, CoronalLimit]);
SliceSizeMap.set(SlicePlane.Coronal, [SagittalLimit, HorizontalLimit]);

const tomographyConstants = TomographyConstants.Instance;

const centerPoint = [tomographyConstants.Sagittal.Center, tomographyConstants.Horizontal.Center, tomographyConstants.Coronal.Center];

THREE.MathUtils.nearestPowerOfTwo = THREE.MathUtils.ceilPowerOfTwo;

export class Slice {
    private readonly _mesh: THREE.Object3D = null;
    private readonly _texture: THREE.Texture = null;
    private readonly _mask: THREE.Texture = null;
    private readonly _slicePlane: SlicePlane = null;

    private _geometry = null;
    private _location: number;

    public constructor(plane: SlicePlane) {
        this._slicePlane = plane;

        this._texture = new THREE.Texture();
        this._texture.generateMipmaps = false;
        this._texture.wrapS = this._texture.wrapT = THREE.ClampToEdgeWrapping;
        this._texture.magFilter = THREE.NearestFilter;
        this._texture.minFilter = THREE.NearestFilter;

        this._mask = new THREE.Texture();
        this._mask.generateMipmaps = false;
        this._mask.wrapS = this._texture.wrapT = THREE.ClampToEdgeWrapping;
        this._texture.magFilter = THREE.NearestFilter;
        this._mask.minFilter = THREE.NearestFilter;

        const material = Slice.createSliceMaterial(this._texture, this._mask);

        this._mesh = this.createSlice(plane, material);
    }

    public get Mesh(): THREE.Object3D {
        return this._mesh;
    }

    public get Location(): number {
        return this._location;
    }

    public updateTextureAndLocation(location, image: SliceResponse) {
        if (location !== null) {
            this.setLocation(location);
        }

        if (image !== null) {
            this._texture.image = image.image;
            this._texture.needsUpdate = true;

            this._mask.image = image.mask;
            this._mask.needsUpdate = true;
        }
    }

    private setLocation(location: number) {
        switch (this._slicePlane) {
            case SlicePlane.Sagittal:
                this._mesh.position.set(location - centerPoint[0], 0, 0);
                break;
            case SlicePlane.Horizontal:
                this._mesh.position.set(0, location - centerPoint[1], 0);
                break;
            case SlicePlane.Coronal:
                this._mesh.position.set(0, 0, location - centerPoint[2]);
                break;
        }
    }

    private createSlice(plane: SlicePlane, material: THREE.Material): THREE.Object3D {
        const size = SliceSizeMap.get(plane);

        this._geometry = new THREE.PlaneGeometry(size[0], size[1], 32);

        switch (plane) {
            case SlicePlane.Sagittal:
                this._geometry.rotateY(Math.PI / 2);
                this._geometry.scale(1, -1, -1);
                break;
            case SlicePlane.Horizontal:
                this._geometry.rotateX(Math.PI / 2);
                this._geometry.scale(1, 1, -1);
                break;
            case SlicePlane.Coronal:
                this._geometry.scale(1, -1, 1);
                break;
        }

        return new THREE.Mesh(this._geometry, material);
    }

    private static createSliceMaterial(texture: THREE.Texture, maskTexture: THREE.Texture): THREE.Material {
        return new THREE.MeshBasicMaterial({
            map: texture,
            alphaMap: maskTexture,
            alphaTest: 0.5,
            color: 0xffffff,
            side: THREE.DoubleSide,
            opacity: 1.0,
            transparent: false,
            depthTest: true
        });
    }
}