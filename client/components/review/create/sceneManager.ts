import * as THREE from "three";
import {SharkViewer} from "../../../viewer/shark_viewer";

const OrbitControls = require("ndb-three-orbit-controls")(THREE);

export class SwcNodeData {
    sampleNumber: number;
    parentNumber: number;
    type: number;
    x: number;
    y: number;
    z: number;
    radius: number;
}

export type SwcData = Map<number, SwcNodeData>;

export class SceneManager {
    /* swc neuron json object:
     *	{ id : {
     *		type: <type number of node (string)>,
     *		x: <x position of node (float)>,
     *		y: <y position of node (float)>,
     *		z: <z position of node (float)>,
     *		parent: <id number of node"s parent (-1 if no parent)>,
     *		radius: <radius of node (float)>,
     *		}
     *	}
     */

    public flipYAxis = true;

    public centerPoint: THREE.Vector3 = new THREE.Vector3(0.0, 0.0, 0.0);

    private renderer: THREE.WebGLRenderer = null;
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera = null;
    private readonly neuronGroup: THREE.Group;
    private readonly compartmentGroup: THREE.Group;

    private last_anim_timestamp: number = null;
    private trackControls: any = null;

    private readonly _neurons = new Map<string, THREE.Object3D>();

    public constructor(container: HTMLElement) {
        if (container === null) {
            return;
        }

        const width = container.clientWidth;
        const height = container.clientHeight;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this.renderer.setClearColor(new THREE.Color(0.98, 0.98, 0.98), 1);

        this.renderer.setSize(width, height);

        container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        const fov = 45;
        //const cameraPosition = this.calculateCameraPosition(fov);
        const cameraPosition = -15000;
        this.camera = new THREE.PerspectiveCamera(fov, width / height, 1, cameraPosition * 5);
        this.scene.add(this.camera);

        this.camera.position.z = cameraPosition;

        if (this.flipYAxis === true) {
            this.camera.up.setY(-1);
        }

        let light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, 10000);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, -10000);
        this.scene.add(light);

        this.neuronGroup = new THREE.Group();
        this.scene.add(this.neuronGroup);

        this.compartmentGroup = new THREE.Group();
        this.scene.add(this.compartmentGroup);

        this.trackControls = new OrbitControls(this.camera, container);
        this.trackControls.addEventListener("change", () => this.render());

        window.addEventListener("resize", () => this.setSize(container.clientWidth, container.clientHeight/*this.renderer.getSize().height*/));
    };

    public animate(timestamp: number = null) {
        if (!this.last_anim_timestamp) {
            this.last_anim_timestamp = timestamp;
            this.render();
        } else if (timestamp - this.last_anim_timestamp > 50) {
            this.last_anim_timestamp = timestamp;
            this.trackControls.update();
            this.render();
        }

        window.requestAnimationFrame((timestamp: number) => this.animate(timestamp));
    };

    public setSize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.render();
    }

    public loadNeuron(name: string, color: string, nodes: SwcData) {
        const neuron = this.createNeuron(nodes, color);

        neuron.name = name;

        if (this.centerPoint !== null) {
            neuron.position.set(-this.centerPoint.x, -this.centerPoint.y, -this.centerPoint.z);
        }

        this._neurons.set(name, neuron);

        this.neuronGroup.add(neuron);
    };

    public removeAllNeurons() {
        this.neuronGroup.remove(...this.neuronGroup.children);
    }

    private generateSkeleton(node: any, node_parent: any) {
        const vertex = new THREE.Vector3(node.x, node.y, node.z);

        const vertex_parent = new THREE.Vector3(node_parent.x, node_parent.y, node_parent.z);

        return {
            "child": vertex,
            "parent": vertex_parent
        };
    };

    private createNeuron(swcData: SwcData, color: string) {
        const neuron = new THREE.BufferGeometry();

        const points = [];

        Array.from(swcData.values()).map(node => {
            points.push(node.x, node.y, node.z);
        });

        neuron.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

        const material = new THREE.PointsMaterial({color: new THREE.Color(color)});

        const coneMesh = new THREE.Points(neuron, material);

        return coneMesh;
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }
}
