import * as React from "react";

import {QueryFilter} from "./QueryFilter";
import {NdbConstants} from "../../models/constants";
import {IQueryHeaderBaseProps, QueryHeader} from "./QueryHeader";
import {columnStyle} from "../../util/styles";
import {UIQueryPredicate} from "../../models/uiQueryPredicate";
import {List} from "semantic-ui-react";

interface IQueryFilterContainerProps extends IQueryHeaderBaseProps {
    constants: NdbConstants;
    predicateList: UIQueryPredicate[];
    onResetPage(): void;
}

const styles = {
    searchRow: {
        margin: "0px",
        padding: "8px"
    }
};

export function QueryFilterContainer(props: IQueryFilterContainerProps) {
    const renderPredicates = (style: any) => {
        const listItems = props.predicateList.map((q, index) => (
            <List.Item key={`qf_${q.id}`} style={{padding: "0", margin: 0, border: "none"}}>
                <QueryFilter queryFilter={q}
                             isComposite={index > 0}
                             isRemovable={props.predicateList.length > 1}
                             constants={props.constants}
                             queryOperators={props.constants.QueryOperators}
                             onChangeFilter={(f) => props.predicates.replacePredicate(f)}
                             onRemoveFilter={(id: string) => props.predicates.removePredicate(id)}
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
}
