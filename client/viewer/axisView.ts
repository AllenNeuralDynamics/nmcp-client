import * as THREEM from "three";
import {ICameraObserver} from "./shark_viewer";
import {CompartmentMeshSet} from "../models/compartmentMeshSet";

const THREE = require("three");
const fontJson = require("three/examples/fonts/helvetiker_regular.typeface.json");

export class AxisViewer implements ICameraObserver {
    public dom_element = 'container';

    public HEIGHT = window.innerHeight;
    public WIDTH = window.innerWidth;

    private renderer = null;
    private scene = null;
    private camera = null;
    private fov: number = 1;
    private last_anim_timestamp = null;
    private _axesGroup: THREEM.Group;

    private _meshVersion: CompartmentMeshSet;

    public get Scene(): THREEM.Scene {
        return this.scene;
    }

    public get MeshVersion(): CompartmentMeshSet {
        return this._meshVersion;
    }

    public set MeshVersion(v: CompartmentMeshSet) {
        this._meshVersion = v;

        this._axesGroup.rotation.y = v.MeshRotation;
    }

    public setSize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        this.HEIGHT = height;
        this.WIDTH = width;

        this.render();
    };

    public init() {
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        this.renderer.setSize(this.WIDTH, this.HEIGHT);

        document.getElementById(this.dom_element).appendChild(this.renderer.domElement);

        // upload a scene
        this.scene = new THREE.Scene();

        // put a camera in the scene
        this.fov = 45;

        const cameraPosition = -1;
        this.camera = new THREE.PerspectiveCamera(this.fov, this.WIDTH / this.HEIGHT, .5, cameraPosition * 2);

        this.scene.add(this.camera);

        this.camera.position.z = cameraPosition;

        this.camera.up.setY(-1);

        this.camera.lookAt(new THREE.Vector3());

        //Lights
        let light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, 10000);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, -10000);
        this.scene.add(light);

        this.loadAxes();
    }

    public animate = (timestamp = null) => {
        if (!this.last_anim_timestamp) {
            this.last_anim_timestamp = timestamp;
            this.render();
        } else if (timestamp - this.last_anim_timestamp > 50) {
            this.last_anim_timestamp = timestamp;
            this.render();
        }

        window.requestAnimationFrame(this.animate);
    };

    public void

    cameraChanged(camera: THREE.PerspectiveCamera) {

        if (this.camera) {
            const scale = Math.max(...camera.position.toArray().map(p => Math.abs(p)));

            this.camera.position.set(camera.position.x / scale, camera.position.y / scale, camera.position.z / scale);
            this.camera.lookAt(0, 0, 0);

            this.camera.updateProjectionMatrix();

            this.render();
        }
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    private loadAxes() {
        this._axesGroup = new THREE.Group();

        const axes = new THREE.AxesHelper(0.25);

        this._axesGroup.add(axes);

        const font = new THREE.Font(fontJson);

        const x = this.createLabel("X", new THREE.Color("#FF0000"), font);
        x.scale.set(1, -1, 1);
        x.position.set(0.25, .06125, 0);
        this._axesGroup.add(x);

        const y = this.createLabel("Y", new THREE.Color("#00FF00"), font);
        y.scale.set(1, -1, 1);
        y.position.set(-.05, 0.375, 0);
        this._axesGroup.add(y);

        const z = this.createLabel("Z", new THREE.Color("#0000FF"), font);
        z.scale.set(1, -1, 1);
        z.position.set(-.05, .05, .26);
        this._axesGroup.add(z);

        this.scene.add(this._axesGroup);
    }

    private createLabel(label: string, color: THREE.Color, font: THREE.Font): THREE.Mesh {
        const textGeo = new THREE.TextGeometry(label, {
            font,
            size: .1,
            height: 0.01
        });

        const textMaterial = new THREE.MeshBasicMaterial({color});

        return new THREE.Mesh(textGeo, textMaterial);
    }
}
