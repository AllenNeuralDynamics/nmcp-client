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

export class QueryFilterContainer extends React.Component<IQueryFilterContainerProps, {}> {
     private renderPredicates(style: any) {
        const listItems = this.props.predicateList.map((q, index) => (
            <List.Item key={`qf_${q.id}`} style={{padding: "0", margin: 0, border: "none"}}>
                <QueryFilter queryFilter={q}
                             isComposite={index > 0}
                             isRemovable={this.props.predicateList.length > 1}
                             constants={this.props.constants}
                             queryOperators={this.props.constants.QueryOperators}
                             onChangeFilter={(f) => this.props.predicates.replacePredicate(f)}
                             onRemoveFilter={(id: string) => this.props.predicates.removePredicate(id)}
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
    }

    public render() {
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
                    <QueryHeader {...this.props}/>
                </div>
                {this.props.isCollapsed ? null : this.renderPredicates(flexStyle)}
            </div>
        );
    }
}
