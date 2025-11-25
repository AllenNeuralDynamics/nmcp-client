import * as React from "react";
import {observer} from "mobx-react-lite";
import {Flex, HoverCard, Text} from "@mantine/core";

import {infoNotification} from "../common/NotificationHelper";

export const Footer = observer(() => {
    const citationText = `Allen Institute for Neural Dynamics. (${(new Date().getFullYear())}). Whole brain single neuron reconstructions. Available from: https://morphology.allenneuraldynamics.org.`

    const citation = (<span style={{textDecoration: "underline"}} onClick={async () => {
        await navigator.clipboard.writeText(citationText);
        infoNotification("", "Citation copied to clipboard");
    }}>citation</span>);

    const content = (
        <div>
            <p style={{fontSize: "smaller"}}>
                If you use this data, please cite it as (click "citation" below copy to clipboard):
            </p>
            <p style={{marginLeft: "16px", marginRight: "16px", fontStyle: "italic"}}>
                {citationText}
            </p>
            <p style={{fontSize: "x-small", color: "darkgray"}}>
                Data available under <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. You are
                welcome to use, share, and adapt the data,
                provided that appropriate credit is given by including the citation above. For more detail and examples, see
                https://alleninstitute.org/citation-policy/.
            </p>
        </div>
    )

    const citationPopup = <HoverCard>
        <HoverCard.Target>
            {citation}
        </HoverCard.Target>
        <HoverCard.Dropdown maw={600}>
            {content}
        </HoverCard.Dropdown>
    </HoverCard>

    return (
        <Flex p={12} bg="section">
            <Text size="sm" style={{flexGrow: 1}}>Neuron Morphology Community Portal Copyright © 2023 - {(new Date().getFullYear())} Allen Institute</Text>
            <Text size="sm" ta="end">Data available under <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by/4.0/">CC BY
                4.0</a>. Free to use
                with {citationPopup}.
            </Text>
        </Flex>
    )
});
