export type ExampleDefinition = {
    name: string;
    filters: any[];
    brainAreas: number[];
    viewOrientation: {
        r1: number;
        r2: number;
    }
    colors: string[];
}
export const examples: ExampleDefinition[] = [
    {
        name: "Striatum ventral region",
        filters: [
            {
                id: "cj8q0op1000003c4xc3wnlvku",
                index: 0,
                brainAreaFilterTypeOption: 1,
                filter: {
                    neuronalStructureId: "d4fe500f-01fe-47b8-91c4-42d1550115cd",
                    operatorId: "f191e8b3-8fb9-4151-a48c-432c1a2382cd",
                    amount: "50",
                    brainAreaStructureIds: [493],
                    arbCenter: {x: "6500", y: "4000", z: "5500"},
                    arbSize: "1000",
                    invert: false,
                    composition: 3
                }
            }
        ],
        brainAreas: [
            56, 502, 491
        ],
        viewOrientation: {r1: -Math.PI / 4, r2: Math.PI / 4},
        colors: ["#0000ff"]
    },
    {
        name: "Piriform area",
        filters: [
            {
                id: "cj8q0op1000003c4xc3wnlvkv",
                index: 0,
                brainAreaFilterTypeOption: 1,
                filter: {
                    neuronalStructureId: "d4fe500f-01fe-47b8-91c4-42d1550115cd",
                    operatorId: "f191e8b3-8fb9-4151-a48c-432c1a2382cd",
                    amount: "15",
                    brainAreaStructureIds: [961],
                    arbCenter: {x: "6500", y: "4000", z: "5500"},
                    arbSize: "1000",
                    invert: false,
                    composition: 3
                }
            },
            {
                id: "cj8q0op1000003c4xc3wnlvky",
                index: 1,
                brainAreaFilterTypeOption: 1,
                filter: {
                    neuronalStructureId: "d4fe500f-01fe-47b8-91c4-42d1550115cd",
                    operatorId: null,
                    amount: "15",
                    brainAreaStructureIds: [342],
                    arbCenter: {x: "6500", y: "4000", z: "5500"},
                    arbSize: "1000",
                    invert: false,
                    composition: 3
                }
            }
        ],
        brainAreas: [],
        viewOrientation: {r1: 0, r2: 0},
        colors: ["#0000ff"]
    },
    {
        name: "Primary visual area, layer6a",
        filters: [
            {
                id: "cj8q0op1000003c4xc3wnlvkz",
                index: 0,
                brainAreaFilterTypeOption: 1,
                filter: {
                    neuronalStructureId: "fc6ba542-1a5d-417a-b33e-8eb23b96e473",
                    operatorId: null,
                    amount: "0",
                    brainAreaStructureIds: [33],
                    arbCenter: {x: "6500", y: "4000", z: "5500"},
                    arbSize: "1000",
                    invert: false,
                    composition: 3
                }
            }
        ],
        brainAreas: [],
        viewOrientation: {r1: 0, r2: 0},
        colors: ["#0000ff", "#ff0000"]
    },
    {
        name: "Gustatory area",
        filters: [
            {
                id: "cj8q0op1000003c4xc3wnlvkw",
                index: 0,
                brainAreaFilterTypeOption: 1,
                filter: {
                    neuronalStructureId: "d4fe500f-01fe-47b8-91c4-42d1550115cd",
                    operatorId: "f191e8b3-8fb9-4151-a48c-432c1a2382cd",
                    amount: "15",
                    brainAreaStructureIds: [1057],
                    arbCenter: {x: "6500", y: "4000", z: "5500"},
                    arbSize: "1000",
                    invert: false,
                    composition: 3
                }
            }
        ],
        brainAreas: [741],
        viewOrientation: {r1: Math.PI / 4, r2: Math.PI / 5},
        colors: ["#0000ff", "#ff0000", "#00ff00"]
    },
    {
        name: "Custom region",
        filters: [
            {
                id: "cj8q0op1000003c4xc3wnlvju",
                index: 0,
                brainAreaFilterTypeOption: 2,
                filter: {
                    neuronalStructureId: "fc6ba542-1a5d-417a-b33e-8eb23b96e473",
                    operatorId: null,
                    amount: "0",
                    brainAreaStructureIds: [],
                    arbCenter: {x: "5315.4", y: "5103", z: "6113.4"},
                    arbSize: "500",
                    invert: false,
                    composition: 3
                }
            }
        ],
        brainAreas: [],
        viewOrientation: {r1: 0, r2: 0},
        colors: ["#0000ff", "#ff0000", "#00ff00", "#00ffff"]
    }
];
