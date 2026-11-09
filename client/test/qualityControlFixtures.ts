// A stored v03 output, with its document trimmed from ../nmcp-qc/sample.json to one metric per status.
function metric(name: string, phase: string, status: string, description: string, reference: string | null = null) {
    return {
        object_type: "QC metric",
        name,
        modality: {name: "Selective plane illumination microscopy", abbreviation: "SPIM"},
        stage: "Processing",
        value: 0.0,
        status_history: [{object_type: "QC status", evaluator: "Automated: standard_morph", status, timestamp: "2026-11-06T19:35:38.067152Z"}],
        description,
        reference,
        tags: {phase},
        evaluated_assets: null
    };
}

export const v3Document = {
    object_type: "Quality control",
    schema_version: "2.4.2",
    metrics: [
        metric("required_columns", "integrity", "Pass",
            "All required SWC columns are present. | Measurements: required_columns=[node_id, compartment, x, y, z, r, parent], missing_columns=[]"),
        metric("single_root_node", "morphology", "Pass",
            "Single valid root: one soma-type root, node_id 1. | Measurements: n_soma_roots=1, n_type1_nodes=1"),
        metric("branch_max_degree", "morphology", "Pending",
            "14 branch point(s) have more than 2 children. | Thresholds: max_children=2",
            "js:neuroglancer?action=goto:10861.29,13008.887,14324.061&action=goto:11395.24,13410.829,14262.913&action=goto:11427.719,13468.269,14261.146"),
        metric("duplicate_node_coordinates", "morphology", "Fail",
            "2 node(s) in 1 group(s) share coordinates with another node. | Measurements: n_duplicate_groups=1",
            "js:neuroglancer?action=goto:11027.093,12976.864,14293&action=goto:11027.093,12976.864,14293")
    ],
    key_experimenters: null,
    notes: null,
    default_grouping: ["phase"],
    allow_tag_failures: [],
    status: {"phase:morphology": "Fail", "phase:integrity": "Pass", "SPIM": "Fail", "Processing": "Fail"}
};

export const v3Data = {
    serviceVersion: 3,
    toolVersion: "1.0.2",
    when: "2026-11-06T19:35:38.500Z",
    qcServiceVersion: "3.1.0",
    score: 400,
    error: null,
    qualityControl: v3Document
};
