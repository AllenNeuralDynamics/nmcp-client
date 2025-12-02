const lightBackgroundColor = "#f3f4f5";
const darkBackgroundColor = "#242424";

export function viewerBackgroundColor(isDark: boolean) {
    return isDark ? darkBackgroundColor : lightBackgroundColor;
}

export const immutableDefaultState = {
    dimensions: {
        x: [
            0.00001,
            "m"
        ],
        y: [
            0.00001,
            "m"
        ],
        z: [
            0.00001,
            "m"
        ],
        t: [
            0.001,
            "s"
        ]
    },
    position: [
        659.5,
        399.5,
        569.5,
        0
    ],
    projectionOrientation: [
        -0.2892743945121765,
        0.45396557450294495,
        0.1698378622531891,
        0.8254639506340027
    ],
    crossSectionScale: 2.7182818284590446,
    projectionScale: 1536,
    showAxisLines: false,
    layout: "3d",
    layerListPanel: {
        visible: false
    },
    selection: {
        visible: false
    },
    showDefaultAnnotations: false
}
