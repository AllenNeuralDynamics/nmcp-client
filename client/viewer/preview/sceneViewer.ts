import {SceneData, SceneManager, SceneNode} from "./sceneManager";

export class SceneViewer {
    private readonly _container: HTMLElement;
    private readonly _sceneManager: SceneManager;

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

    public async loadFiles(file: File): Promise<[number, number]> {
        this._sceneManager.removeAllNeurons();

        if (file === null) {
            return [0, 0];
        }

        let axonNodes: SceneNode[] = [];
        let dendriteNodes: SceneNode[] = [];

        try {
            const data = await this.loadFile(file);

            if (file.name.endsWith(".json")) {
                [axonNodes, dendriteNodes] = jsonParse(data);
            } else if (file.name.endsWith(".swc")) {
                [axonNodes, dendriteNodes] = swcParse(data);
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
        } catch (error) {
            console.log(error);
        }

        return [axonNodes.length, dendriteNodes.length];
    }

    private loadFile(file: File): Promise<string> {
        return new Promise<string>((resolve) => {
            const reader = new FileReader();

            reader.onload = ((data: ProgressEvent) => {
                if (data.loaded === data.total) {
                    const contents: string = reader.result as string;

                    resolve(contents);
                }
            });

            reader.readAsText(file);
        })
    }
}

function jsonParse(contents: string): [SceneNode[], SceneNode[]] {

    const obj = JSON.parse(contents);

    let axonNodes: SceneNode[] = [];
    let dendriteNodes: SceneNode[] = [];

    try {
        const axon = obj.neurons[0].axon;

        axonNodes = parseJsonNodes(axon)

        const dendrite = obj.neurons[0].dendrite;

        dendriteNodes = parseJsonNodes(dendrite);

    } catch (err) {
        console.log(err);
    }

    return [axonNodes, dendriteNodes];
}

function parseJsonNodes(nodes: any[]): SceneNode[] {
    return nodes.map((n: any) => {
        const node = new SceneNode();

        node.id = n.sampleNumber;
        node.x = n.x;
        node.y = n.y;
        node.z = n.z;

        return node;
    });
}

function swcParse(contents: string): [SceneNode[], SceneNode[]] {
    let axonNodes: SceneNode[] = [];
    let dendriteNodes: SceneNode[] = [];

    const lines = contents.split(/\r\n|\r|\n/g);

    lines.forEach(line => {
        const trimmed = line.trim();

        if (trimmed.length == 0 || trimmed.startsWith("#")) {
            return;
        }

        const nodeContents = line.split(/\s/).map(n => n.trim());

        if (nodeContents.length < 5) {
            return;
        }

        try {
            const node = new SceneNode();

            node.id = parseInt(nodeContents[0]);
            node.z = parseFloat(nodeContents[2]);
            node.y = parseFloat(nodeContents[3]);
            node.x = parseFloat(nodeContents[4]);

            const kind = parseInt(nodeContents[1]);


            if (kind == 1) {
                axonNodes.push(node);
                dendriteNodes.push(node);
            } else if (kind == 2) {
                axonNodes.push(node);
            } else if (kind == 3) {
                dendriteNodes.push(node);
            } else {
                console.log(`unexpected node structure ${kind}`);
            }

            return node;
        } catch (err) {
            return null;
        }
    });

    return [axonNodes, dendriteNodes];
}
