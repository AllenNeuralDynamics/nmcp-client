import * as React from "react";
import {List} from "semantic-ui-react";

import {useConstants} from "../../../hooks/useConstants";
import {QueryFilter} from "./QueryFilter";
import {IQueryHeaderBaseProps, QueryHeader} from "./QueryHeader";
import {columnStyle} from "../../../util/styles";
import {useQueryPredicates} from "../../../hooks/useQueryPredicates";
import {observer} from "mobx-react";

export interface IQueryFilterContainerProps extends IQueryHeaderBaseProps {

}

const styles = {
    searchRow: {
        margin: "0px",
        padding: "8px"
    }
};

export const QueryFilterContainer = observer((props: IQueryFilterContainerProps) => {
    const constants = useConstants();

    const uiPredicates = useQueryPredicates();

    const predicates = uiPredicates.predicates;

    const renderPredicates = (style: any) => {
        const listItems = predicates.map((q, index) => (
            <List.Item key={`qf_${q.id}`} style={{padding: "0", margin: 0, border: "none"}}>
                <QueryFilter queryFilter={q}
                             isComposite={index > 0}
                             isRemovable={predicates.length > 1}
                             queryOperators={constants.QueryOperators}
                             onChangeFilter={(f) => uiPredicates.replacePredicate(f)}
                             onRemoveFilter={(id: string) => uiPredicates.removePredicate(id)}
                />
            </List.Item>
        ));

        return (
            <div style={style}>
                <List style={styles.searchRow}>
                    {listItems}
                </List>
            </div>
        );
    };

    const flexStyle = {
        height: "300px",
        backgroundColor: "#efefef",
        width: "100%",
        flexGrow: 1,
        flexShrink: 1,
        order: 2,
        overflow: "auto"
    };

    return (
        <div style={columnStyle}>
            <div style={{width: "100%", order: 1, flexBasis: "auto"}}>
                <QueryHeader {...props}/>
            </div>
            {props.isCollapsed ? null : renderPredicates(flexStyle)}
        </div>
    );
});
