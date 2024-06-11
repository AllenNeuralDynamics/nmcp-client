import {NODE_PARTICLE_IMAGE} from "./util";

import * as THREEM from "three";
import {SystemShader} from "./shaders/shaders";
import {StandardShader} from "./shaders/standardShader";
import {CompartmentMeshSet} from "../models/compartmentMeshSet";
import {UserPreferences} from "../util/userPreferences";

const THREE = require("three");
require("three-obj-loader")(THREE);
const OrbitControls = require("ndb-three-orbit-controls")(THREE);

const DEFAULT_POINT_THRESHOLD = 50;

export interface ICameraObserver {
    cameraChanged(camera: THREE.PerspectiveCamera);
}

export class SharkViewer {
    public dom_element = 'container';

    //height of canvas
    public HEIGHT = window.innerHeight;
    //width of canvas
    public WIDTH = window.innerWidth;

    public static Shader: SystemShader = new StandardShader();

    //color array, nodes of type 0 show as first color, etc.
    public colors = [
        0x31ffdc,
        0x6d4ff3,
        0xaa3af0,
        0xf38032,
        0x59fc20,
        0xf8d43c,
        0xfd2c4d,
        0xc9c9c9,
    ];
    public radius_scale_factor = 1;
    public metadata = false;
    public centerPoint = null;
    public on_select_node = null;
    public on_toggle_node = null;

    private three_colors = [];
    private three_materials = [];
    private fov: number = 1;
    private show_cones = true;
    private last_anim_timestamp = null;
    private mouseHandler = null;
    private nodeParticleTexture = NODE_PARTICLE_IMAGE;
    private min_radius = null;
    private rayCaster = new THREE.Raycaster();
    private trackControls = null;
    private backgroundColor = 0xffffff;
    private renderer = null;
    private scene = null;
    private camera = null;
    private cameraObservers: ICameraObserver[] = [];
    private _compartmentGroup: THREEM.Group;

    private _meshVersion: CompartmentMeshSet;

    public get Scene(): THREEM.Scene {
        return this.scene;
    }

    public get MeshVersion(): CompartmentMeshSet {
        return this._meshVersion;
    }

    public set MeshVersion(v: CompartmentMeshSet) {
        this._compartmentGroup.clear();
        this._meshVersion = v;
        this._compartmentGroup.rotation.y = v.MeshRotation;
    }

    static generateParticle(node) {
        return new THREE.Vector3(node.x, node.y, node.z);
    }

    private nodeColor(node) {
        if (node.type < this.three_colors.length) return this.three_colors[node.type];
        return this.three_colors[0];
    }

    public addCameraObserver(observer: ICameraObserver) {
        if (observer) {
            this.cameraObservers.push(observer);
        }
    }

    private generateCone(node, node_parent, color) {
        const cone_child: any = {};
        const cone_parent: any = {};

        let node_color = this.nodeColor(node);
        if (color) {
            node_color = new THREE.Color(color);
        }
        cone_child.vertex = new THREE.Vector3(node.x, node.y, node.z);
        cone_child.radius = node.radius;
        cone_child.color = node_color;

        let node_parent_color = this.nodeColor(node_parent);
        if (color) {
            node_parent_color = new THREE.Color(color);
        }
        cone_parent.vertex = new THREE.Vector3(node_parent.x, node_parent.y, node_parent.z);
        cone_parent.radius = node_parent.radius;
        cone_parent.color = node_parent_color;

        //normals
        const n1 = new THREE.Vector3().subVectors(cone_parent.vertex, cone_child.vertex);
        const n2 = n1.clone().negate();

        return {
            'child': cone_child,
            'parent': cone_parent,
            'normal1': n1,
            'normal2': n2
        };
    }

    private createNeuron(swc_json, color = undefined) {
        //neuron is object 3d which ensures all components move together
        const neuron = new THREE.Object3D();
        let geometry, material;

        // special imposter image contains:
        // 1 - colorable sphere image in red channel
        // 2 - specular highlight in green channel
        // 3 - depth offset in blue channel (currently unused)
        const image = document.createElement('img');
        const sphereImg = new THREE.Texture(image);
        image.onload = function () {
            sphereImg.needsUpdate = true;
        };
        image.src = this.nodeParticleTexture;

        geometry = new THREE.BufferGeometry();
        // properties that may const from particle to particle. only accessible in vertex shaders!
        //	(can pass color info to fragment shader via vColor.)
        // compute scale for particles, in pixels
        const particleScale = (0.5 * this.HEIGHT / this.renderer.getPixelRatio()) / Math.tan(0.5 * this.fov * Math.PI / 180.0);

        const customAttributes =
            {
                radius: {type: "fv1", value: []},
                typeColor: {type: "c", value: []},
                vertices: {type: "f", value: []},
            };

        const customUniforms =
            {
                particleScale: {type: 'f', value: particleScale},
                sphereTexture: {type: 't', value: sphereImg},
            };

        const indexLookup = {};

        for (const node in swc_json) {
            if (swc_json.hasOwnProperty(node)) {
                let node_color = this.nodeColor(swc_json[node]);

                if (color) {
                    node_color = new THREE.Color(color);
                }

                let particle_vertex = SharkViewer.generateParticle(swc_json[node]);

                let radius = swc_json[node].radius * this.radius_scale_factor;

                if (this.min_radius && radius < this.min_radius) {
                    radius = this.min_radius;
                }

                customAttributes.radius.value.push(radius);
                customAttributes.typeColor.value.push(node_color.r);
                customAttributes.typeColor.value.push(node_color.g);
                customAttributes.typeColor.value.push(node_color.b);
                customAttributes.vertices.value.push(particle_vertex.x);
                customAttributes.vertices.value.push(particle_vertex.y);
                customAttributes.vertices.value.push(particle_vertex.z);

                indexLookup[customAttributes.radius.value.length - 1] = swc_json[node].sampleNumber;
            }
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(customAttributes.vertices.value, 3));
        geometry.setAttribute('radius', new THREE.Float32BufferAttribute(customAttributes.radius.value, 1));
        geometry.setAttribute('typeColor', new THREE.Float32BufferAttribute(customAttributes.typeColor.value, 3));

        material = new THREE.ShaderMaterial(
            {
                uniforms: customUniforms,
                vertexShader: SharkViewer.Shader.NodeShader.VertexShader,
                fragmentShader: SharkViewer.Shader.NodeShader.FragmentShader,
                transparent: true,
                alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5,
            });
        material.extensions.fragDepth = true;


        let materialShader = null;

        const particles = new THREE.Points(geometry, material);
        particles.userData = {indexLookup, materialShader};

        material.onBeforeCompile = function (shader) {
            shader.uniforms.alpha = {value: 0};
            shader.vertexShader = 'uniform float alpha;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                [
                    'vAlpha = alpha'
                ].join('\n')
            );
            materialShader = shader;

            materialShader.uniforms.alpha.value = 0.9;

            particles.userData.materialShader = materialShader;
        };

        neuron.add(particles);

        if (this.show_cones) {
            // Cone quad imposters, to link spheres together
            const coneAttributes =
                {
                    radius: {type: "fv1", value: []},
                    indices: {type: "iv1", value: []},
                    typeColor: {type: "c", value: []},
                    vertices: {type: "f", value: []},
                    normals: {type: "f", value: []},
                    uv: {type: "f", value: []}
                };
            const coneUniforms =
                {
                    sphereTexture: {type: 't', value: sphereImg},
                };
            const uvs = [
                new THREE.Vector2(0.5, 0),
                new THREE.Vector2(0.5, 1),
                new THREE.Vector2(0.5, 1)
            ];
            const coneGeom = new THREE.BufferGeometry();
            let ix21 = 0;
            for (const node in swc_json) {
                if (swc_json.hasOwnProperty(node)) {
                    if (swc_json[node].parent !== -1) {

                        // Paint two triangles to make a cone-imposter quadrilateral
                        // Triangle #1
                        const cone = this.generateCone(swc_json[node], swc_json[swc_json[node].parent], color);

                        let node_color = cone.child.color;
                        if (color) {
                            node_color = new THREE.Color(color);
                        }

                        let child_radius = cone.child.radius * this.radius_scale_factor;

                        if (this.min_radius && child_radius < this.min_radius) {
                            child_radius = this.min_radius;
                        }

                        // vertex 1
                        coneAttributes.vertices.value.push(cone.child.vertex.x);
                        coneAttributes.vertices.value.push(cone.child.vertex.y);
                        coneAttributes.vertices.value.push(cone.child.vertex.z);
                        coneAttributes.radius.value.push(child_radius);
                        coneAttributes.typeColor.value.push(node_color.r);
                        coneAttributes.typeColor.value.push(node_color.g);
                        coneAttributes.typeColor.value.push(node_color.b);
                        coneAttributes.normals.value.push(cone.normal1.x);
                        coneAttributes.normals.value.push(cone.normal1.y);
                        coneAttributes.normals.value.push(cone.normal1.z);
                        coneAttributes.uv.value.push(uvs[0].x);
                        coneAttributes.uv.value.push(uvs[0].y);
                        coneAttributes.indices.value.push(ix21);
                        ix21++;

                        // vertex 2
                        coneAttributes.vertices.value.push(cone.child.vertex.x);
                        coneAttributes.vertices.value.push(cone.child.vertex.y);
                        coneAttributes.vertices.value.push(cone.child.vertex.z);
                        coneAttributes.radius.value.push(child_radius);
                        coneAttributes.typeColor.value.push(node_color.r);
                        coneAttributes.typeColor.value.push(node_color.g);
                        coneAttributes.typeColor.value.push(node_color.b);
                        coneAttributes.normals.value.push(cone.normal2.x);
                        coneAttributes.normals.value.push(cone.normal2.y);
                        coneAttributes.normals.value.push(cone.normal2.z);
                        coneAttributes.uv.value.push(uvs[1].x);
                        coneAttributes.uv.value.push(uvs[1].y);
                        coneAttributes.indices.value.push(ix21);
                        ix21++;

                        // vertex 3
                        coneAttributes.vertices.value.push(cone.parent.vertex.x);
                        coneAttributes.vertices.value.push(cone.parent.vertex.y);
                        coneAttributes.vertices.value.push(cone.parent.vertex.z);
                        coneAttributes.radius.value.push(child_radius);
                        coneAttributes.typeColor.value.push(node_color.r);
                        coneAttributes.typeColor.value.push(node_color.g);
                        coneAttributes.typeColor.value.push(node_color.b);
                        coneAttributes.normals.value.push(cone.normal2.x);
                        coneAttributes.normals.value.push(cone.normal2.y);
                        coneAttributes.normals.value.push(cone.normal2.z);
                        coneAttributes.uv.value.push(uvs[2].x);
                        coneAttributes.uv.value.push(uvs[2].y);
                        coneAttributes.indices.value.push(ix21);
                        ix21++;

                        // Triangle #2
                        // Parent
                        node_color = cone.parent.color;
                        if (color) {
                            node_color = new THREE.Color(color);
                        }

                        let parent_radius = cone.parent.radius * this.radius_scale_factor;
                        if (this.min_radius && parent_radius < this.min_radius) {
                            parent_radius = this.min_radius;
                        }

                        // vertex 1
                        coneAttributes.vertices.value.push(cone.parent.vertex.x);
                        coneAttributes.vertices.value.push(cone.parent.vertex.y);
                        coneAttributes.vertices.value.push(cone.parent.vertex.z);
                        coneAttributes.radius.value.push(parent_radius);
                        coneAttributes.typeColor.value.push(node_color.r);
                        coneAttributes.typeColor.value.push(node_color.g);
                        coneAttributes.typeColor.value.push(node_color.b);
                        coneAttributes.normals.value.push(cone.normal1.x);
                        coneAttributes.normals.value.push(cone.normal1.y);
                        coneAttributes.normals.value.push(cone.normal1.z);
                        coneAttributes.uv.value.push(uvs[0].x);
                        coneAttributes.uv.value.push(uvs[0].y);
                        coneAttributes.indices.value.push(ix21);
                        ix21++;

                        // vertex 2
                        coneAttributes.vertices.value.push(cone.parent.vertex.x);
                        coneAttributes.vertices.value.push(cone.parent.vertex.y);
                        coneAttributes.vertices.value.push(cone.parent.vertex.z);
                        coneAttributes.radius.value.push(parent_radius);
                        coneAttributes.typeColor.value.push(node_color.r);
                        coneAttributes.typeColor.value.push(node_color.g);
                        coneAttributes.typeColor.value.push(node_color.b);
                        coneAttributes.normals.value.push(cone.normal2.x);
                        coneAttributes.normals.value.push(cone.normal2.y);
                        coneAttributes.normals.value.push(cone.normal2.z);
                        coneAttributes.uv.value.push(uvs[1].x);
                        coneAttributes.uv.value.push(uvs[1].y);
                        coneAttributes.indices.value.push(ix21);
                        ix21++;

                        // vertex 3
                        coneAttributes.vertices.value.push(cone.child.vertex.x);
                        coneAttributes.vertices.value.push(cone.child.vertex.y);
                        coneAttributes.vertices.value.push(cone.child.vertex.z);
                        coneAttributes.radius.value.push(parent_radius);
                        coneAttributes.typeColor.value.push(node_color.r);
                        coneAttributes.typeColor.value.push(node_color.g);
                        coneAttributes.typeColor.value.push(node_color.b);
                        coneAttributes.normals.value.push(cone.normal1.x);
                        coneAttributes.normals.value.push(cone.normal1.y);
                        coneAttributes.normals.value.push(cone.normal1.z);
                        coneAttributes.uv.value.push(uvs[2].x);
                        coneAttributes.uv.value.push(uvs[2].y);
                        coneAttributes.indices.value.push(ix21);
                        ix21++;
                    }
                }
            }

            coneGeom.setIndex(new THREE.Uint32BufferAttribute(coneAttributes.indices.value, 1));
            coneGeom.setAttribute('position', new THREE.Float32BufferAttribute(coneAttributes.vertices.value, 3));
            coneGeom.setAttribute('radius', new THREE.Float32BufferAttribute(coneAttributes.radius.value, 1));
            coneGeom.setAttribute('typeColor', new THREE.Float32BufferAttribute(coneAttributes.typeColor.value, 3));
            coneGeom.setAttribute('normal', new THREE.Float32BufferAttribute(coneAttributes.normals.value, 3));
            coneGeom.setAttribute('uv', new THREE.Float32BufferAttribute(coneAttributes.uv.value, 2));

            const coneMaterial = new THREE.ShaderMaterial(
                {
                    uniforms: coneUniforms,
                    vertexShader: SharkViewer.Shader.PathShader.VertexShader,
                    fragmentShader: SharkViewer.Shader.PathShader.FragmentShader,
                    transparent: true,
                    depthTest: true,
                    side: THREE.DoubleSide,
                    alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5,
                });

            const coneMesh = new THREE.Mesh(coneGeom, coneMaterial);

            coneMaterial.onBeforeCompile = function (shader) {
                // console.log( shader )
                shader.uniforms.alpha = {value: 0};
                shader.vertexShader = 'uniform float alpha;\n' + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    [
                        'vAlpha = alpha'
                    ].join('\n')
                );
                materialShader = shader;

                materialShader.uniforms.alpha.value = 0.9;

                coneMesh.userData = {materialShader};
            };

            neuron.add(coneMesh);
        }

        return neuron;
    }

    public init() {
        //set up colors and materials based on color array
        this.three_colors = [];
        for (const color in this.colors) {
            if (this.colors.hasOwnProperty(color)) {
                this.three_colors.push(new THREE.Color(this.colors[color]));
            }
        }
        this.three_materials = [];
        for (const color in this.colors) {
            if (this.colors.hasOwnProperty(color)) {
                this.three_materials.push(new THREE.MeshBasicMaterial({color: this.colors[color]}));
            }
        }

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setClearColor(this.backgroundColor, 1);
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        document.getElementById(this.dom_element).appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.fov = 45;

        const cameraPosition = -20000;
        this.camera = new THREE.PerspectiveCamera(this.fov, this.WIDTH / this.HEIGHT, 1, cameraPosition * 5);

        this.scene.add(this.camera);

        this.camera.position.z = cameraPosition;

        this.camera.up.setY(-1);

        let light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, 10000);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, -10000);
        this.scene.add(light);

        this._compartmentGroup = new THREE.Group();
        this.scene.add(this._compartmentGroup);

        this.trackControls = new OrbitControls(this.camera, document.getElementById(this.dom_element));
        this.trackControls.zoomSpeed = UserPreferences.Instance.ZoomSpeed;
        this.trackControls.addEventListener("change", () => {
            this.cameraObservers.forEach(c => c.cameraChanged(this.camera));
            this.render();
        });

        this.rayCaster.params.Points.threshold = DEFAULT_POINT_THRESHOLD;

        UserPreferences.Instance.addListener({
            preferenceChanged: (name) => {
                if (name === "zoomSpeed") {
                    this.trackControls.zoomSpeed = UserPreferences.Instance.ZoomSpeed;
                }
            }
        });
    }

    public addEventHandler(handler) {
        this.mouseHandler = handler;

        this.mouseHandler.DomElement = document.getElementById(this.dom_element);
        this.mouseHandler.addListeners();

        this.mouseHandler.ClickHandler = this.onClick;
        this.mouseHandler.ResetHandler = this.onResetView;
    }

    public onResetView = (r1, r2) => {
        this.trackControls.reset();
        this.trackControls.rotateLeft(r1);
        this.trackControls.rotateUp(r2);
        this.trackControls.update();
    };

    private onClick = (event) => {
        const rect = document.getElementById(this.dom_element).getBoundingClientRect();

        const mouse = new THREE.Vector2();

        mouse.x = ((event.clientX - rect.left) / this.WIDTH) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / this.HEIGHT) * 2 + 1;

        this.rayCaster.setFromCamera(mouse, this.camera);

        const intersects = this.rayCaster.intersectObjects(this.scene.children, true);

        const points = intersects.filter(o => o.object.type === "Points").filter(o => o.object.userData.materialShader.uniforms.alpha.value > 0.0).sort((a, b) => {
            return a.distanceToRay === b.distanceToRay ? a.distance - b.distance : a.distanceToRay - b.distanceToRay;
        });

        if (points.length > 0) {
            const intersectObject = points[0];

            if (event.altKey) {
                if (this.on_toggle_node) {
                    const sampleNumber = intersectObject.object.userData.indexLookup[intersectObject.index];
                    const tracingId = intersectObject.object.parent.name;

                    this.on_toggle_node(tracingId, sampleNumber);
                }
            } else {
                if (!event.shiftKey && !event.altKey && !event.ctrlKey) {
                    this.trackControls.target = points[0].point;
                }

                if (this.on_select_node) {
                    const sampleNumber = intersectObject.object.userData.indexLookup[intersectObject.index];
                    const tracingId = intersectObject.object.parent.name;

                    this.on_select_node(tracingId, sampleNumber, event);
                }
            }
        }
    };

    public animate = (timestamp = null) => {
        if (!this.last_anim_timestamp) {
            this.last_anim_timestamp = timestamp;
            this.render();
        } else if (timestamp - this.last_anim_timestamp > 50) {
            this.last_anim_timestamp = timestamp;
            this.trackControls.update();
            this.render();
        }

        window.requestAnimationFrame(this.animate);
    };

    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    public loadNeuron(filename, color, nodes) {
        const neuron = this.createNeuron(nodes, color);

        neuron.name = filename;

        this.scene.add(neuron);

        if (this.centerPoint !== null) {
            neuron.position.set(-this.centerPoint[0], -this.centerPoint[1], -this.centerPoint[2]);
        }

        // neuron.scale.y = -1;
    };

    public unloadNeuron(filename) {
        const neuron = this.scene.getObjectByName(filename);
        this.scene.remove(neuron);
    };

    public setNeuronMirror(filename: string, mirror: boolean) {
        const neuron = this.scene.getObjectByName(filename);

        if (mirror && neuron.scale.x > 0) {
            neuron.scale.x = -1;
            neuron.position.x = this.centerPoint[0];
        } else if (!mirror && neuron.scale.x < 0) {
            neuron.scale.x = 1;
            neuron.position.x = -this.centerPoint[0];
        }
    };

    public setNeuronVisible(id: string, visible: boolean) {
        const neuron = this.scene.getObjectByName(id);

        if (neuron) {
            neuron.children.map(c => {
                if (c.userData.materialShader) {
                    c.userData.materialShader.uniforms.alpha.value = visible ? 1.0 : 0.0;
                }
            });
        }
    };

    public setNeuronDisplayLevel(id: string, opacity: number) {
        const neuron = this.scene.getObjectByName(id);

        if (neuron) {

            neuron.children.map(c => {
                if (c.userData.materialShader) {
                    c.userData.materialShader.uniforms.alpha.value = opacity;
                }
            });
        }
    };

    public loadCompartment(id: string, geometryFile: string, color) {
        const loader = new THREE.OBJLoader();

        const that = this;

        loader.load(geometryFile, (object) => {
            object.traverse((child) => {
                child.material = new THREE.ShaderMaterial({
                    uniforms: {
                        color: {type: 'c', value: new THREE.Color('#' + color)},
                    },
                    vertexShader: SharkViewer.Shader.CompartmentShader.VertexShader,
                    fragmentShader: SharkViewer.Shader.CompartmentShader.FragmentShader,
                    transparent: true,
                    depthTest: true,
                    depthWrite: false,
                    side: THREE.DoubleSide,
                });
            });

            object.name = id;

            if (that.centerPoint !== null) {
                object.position.set(-that.centerPoint[2], -that.centerPoint[1], -that.centerPoint[0]);
            }

            that._compartmentGroup.add(object);

        });
    };

    public unloadCompartment(id: string) {
        const selectedObj = this._compartmentGroup.getObjectByName(id);
        this._compartmentGroup.remove(selectedObj);
    };

    public setCompartmentVisible(id: string, visible: boolean) {
        const compartment = this._compartmentGroup.getObjectByName(id);

        if (compartment) {
            compartment.visible = visible;
        }
    };

    public setSize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        this.HEIGHT = height;
        this.WIDTH = width;

        this.render();
    };

    public setBackground(color) {
        this.backgroundColor = color;
        this.renderer.setClearColor(this.backgroundColor, 1);
    }
}
