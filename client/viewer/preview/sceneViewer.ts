import {SceneData, SceneManager, SceneNode} from "./sceneManager";
import {NeuronStructureKind} from "../../models/neuronStructure";

export class SceneViewer {
    private readonly _container: HTMLElement;
    private readonly _sceneManager: SceneManager;

    private _cachedFile: File;

    public constructor(elementId: string, backgroundColor: number[]) {
        this._container = document.getElementById(elementId);
        this._sceneManager = new SceneManager(this._container, backgroundColor);
        this._sceneManager.animate();
    }

    public get SceneManager(): SceneManager {
        return this._sceneManager;
    }

    public setBackground(rgb: number[]) {
        this._sceneManager.setBackground(rgb);
    }

    public removeNeurons() {
        this._sceneManager.removeAllNeurons();
    }

    public loadFile(file: File, forceStructure: NeuronStructureKind = null, keep: boolean = false): Promise<[number, number]> {
        return new Promise<[number, number]>((resolve, reject) => {
            if (file === this._cachedFile) {
                resolve(null);
            }

            if (file === null) {
                this._sceneManager.removeAllNeurons();
                resolve([0, 0]);
            }

            const reader = new FileReader();

            reader.onload = ((data: ProgressEvent) => {
                if (data.loaded === data.total) {
                    const contents: string = reader.result as string;

                    let axonNodes: SceneNode[] = [];

                    let dendriteNodes: SceneNode[] = [];

                    if (file.name.endsWith(".json")) {
                        [axonNodes, dendriteNodes] = jsonParse(contents);
                    } else {
                        if (forceStructure == NeuronStructureKind.dendrite || (forceStructure != NeuronStructureKind.axon && file.name.toLowerCase().includes("dendrite"))) {
                            dendriteNodes = swcParse(contents);
                        } else {
                            axonNodes = swcParse(contents);
                        }
                    }

                    if (axonNodes.length === 0 && dendriteNodes.length === 0) {
                        reject("does not appear to be a valid swc file");
                    }

                    if (!keep) {
                        this._sceneManager.removeAllNeurons();
                    }

                    if (axonNodes.length > 0) {
                        const axonData: SceneData = new Map<number, SceneNode>();
                        axonNodes.map(n => axonData.set(n.id, n));
                        this._sceneManager.loadNeuron("axon", "#0000ff", axonData);
                    }

                    if (dendriteNodes.length > 0) {
                        const dendriteData = new Map<number, SceneNode>();
                        dendriteNodes.map(n => dendriteData.set(n.id, n));
                        this._sceneManager.loadNeuron("dendrite", "#00ff00", dendriteData);
                    }

                    resolve([axonNodes.length, dendriteNodes.length]);
                }
            });

            reader.readAsText(file);
        });
    }
}

function swcParse(contents: string): SceneNode[] {
    const lines = contents.split(/\r\n|\r|\n/g);

    return lines.map(line => {
        const trimmed = line.trim();

        if (trimmed.length == 0 || trimmed.startsWith("#")) {
            return null;
        }

        const nodeContents = line.split(/\s/).map(n => n.trim());

        if (nodeContents.length < 5) {
            return null;
        }

        try {
            const node = new SceneNode();

            node.id = parseInt(nodeContents[0]);
            node.z = parseFloat(nodeContents[2]);
            node.y = parseFloat(nodeContents[3]);
            node.x = parseFloat(nodeContents[4]);

            return node;
        } catch (err) {
            return null;
        }
    }).filter(n => n !== null);
}

function jsonParse(contents: string): [SceneNode[], SceneNode[]] {

    const obj = JSON.parse(contents);

    let axonNodes: SceneNode[] = [];
    let dendriteNodes: SceneNode[] = [];

    try {
        const axon = obj.neurons[0].axon;

        axonNodes = parseNodes(axon)

        const dendrite = obj.neurons[0].dendrite;

        dendriteNodes = parseNodes(dendrite);

    } catch (err) {
        console.log(err);
    }

    return [axonNodes, dendriteNodes];
}

function parseNodes(nodes: any[]): SceneNode[] {
    return nodes.map((n: any) => {
        const node = new SceneNode();

        node.id = n.sampleNumber;
        node.x = n.x;
        node.y = n.y;
        node.z = n.z;

        return node;
    });
}
