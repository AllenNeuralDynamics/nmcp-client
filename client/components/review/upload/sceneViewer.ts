import {SceneManager, SwcData, SwcNodeData} from "./sceneManager";
import {SwcInputFile} from "./FilePreview";

export class SceneViewer {
    private _sceneManager: SceneManager;

    private _cachedFile: File;

    public constructor(elementId: string) {
        const container = document.getElementById(elementId);

        this._sceneManager = new SceneManager(container);

        this._sceneManager.animate();
    }

    public loadFile(file: File): Promise<SwcInputFile> {
        return new Promise<SwcInputFile>((resolve, reject) => {
            if (file === this._cachedFile) {
                resolve(null);
            }

            if (file === null) {
                this._sceneManager.removeAllNeurons();
                resolve(null);
            }

            const reader = new FileReader();

            reader.onload = ((data: ProgressEvent) => {
                if (data.loaded === data.total) {
                    const contents: string = reader.result as string;

                    let nodes: SwcNodeData[];

                    let dendriteNodes: SwcNodeData[] = [];

                    if (file.name.endsWith(".json")) {
                        [nodes, dendriteNodes] = jsonParse(contents);
                    } else {
                        nodes = swcParse(contents);
                    }

                    if (nodes.length === 0) {
                        console.log("does not appear to be a valid swc file");
                        reject("does not appear to be a valid swc file");
                    }

                    const swcData: SwcData = new Map<number, SwcNodeData>();

                    nodes.map(n => swcData.set(n.sampleNumber, n));

                    this._sceneManager.removeAllNeurons();

                    this._sceneManager.loadNeuron("sample", "#0000ff", swcData);

                    if (dendriteNodes.length > 0) {
                        const dendriteData = new Map<number, SwcNodeData>();
                        dendriteNodes.map(n => dendriteData.set(n.sampleNumber, n));
                        this._sceneManager.loadNeuron("sample", "#00ff00", dendriteData);
                    }

                    const inputFile = new SwcInputFile();
                    inputFile.file = file;
                    inputFile.nodeCount = nodes.length;

                    resolve(inputFile);
                }
            });

            reader.readAsText(file);
        });
    }
}

function swcParse(contents: string): SwcNodeData[] {
    const lines = contents.split(/\r\n|\r|\n/g);

    return lines.map(line => {
        if (line.trim().startsWith("#")) {
            return null;
        }
        const nodeContents = line.split(/\s/).map(n => n.trim());

        try {
            const node = new SwcNodeData();

            node.sampleNumber = parseInt(nodeContents[0]);

            if (isNaN(node.sampleNumber)) {
                return null;
            }

            node.parentNumber = parseInt(nodeContents[6]);

            if (isNaN(node.parentNumber)) {
                return null;
            }

            node.type = parseInt(nodeContents[1]);

            if (isNaN(node.type)) {
                return null;
            }

            node.z = parseFloat(nodeContents[2]);
            node.y = parseFloat(nodeContents[3]);
            node.x = parseFloat(nodeContents[4]);

            node.radius = parseFloat(nodeContents[5]);

            return node;
        } catch (err) {
            return null;
        }
    }).filter(n => n !== null);
}

function jsonParse(contents: string): [SwcNodeData[], SwcNodeData[]] {

    const obj = JSON.parse(contents);

    let axonNodes: SwcNodeData[] = [];
    let dendriteNodes: SwcNodeData[] = [];

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

function parseNodes(nodes: any[]): SwcNodeData[] {
    return nodes.map((n: any) => {
        const node = new SwcNodeData();

        node.sampleNumber = n.sampleNumber;

        node.parentNumber = n.parentNumber;

        node.type = n.structureIdentifier;

        node.x = n.x;
        node.y = n.y;
        node.z = n.z;

        node.radius = n.radius;

        return node;
    });
}
