import * as React from "react";
import {Button, Icon} from "semantic-ui-react";

import {primaryBackground, spinnerStyle} from "../../util/styles";
import {UIQueryPredicates} from "../../models/uiQueryPredicate";


const styles = {
    toggle: {
        order: 1,
        padding: "4px"
    },
    message: {
        padding: "4px"
    }
};

export enum QueryStatus {
    NeverQueried,
    Loading,
    Loaded
}

export interface IQueryHeaderBaseProps {
    predicates: UIQueryPredicates;
    isCollapsed: boolean;
    status: QueryStatus;
    neuronSystemCount: number;
    neuronMatchCount: number;
    queryDuration: number;

    onToggleCollapsed(): void;

    onPerformQuery(): void;

    onResetPage(): void;
}

export class QueryHeader extends React.Component<IQueryHeaderBaseProps, {}> {
    private renderToggleButton() {
        if (this.props.status === QueryStatus.Loading) {
            return null;
        }

        return (
            <Button size="mini" inverted icon="remove circle" content="Reset" onClick={() => this.props.onResetPage()}/>
        )
    }

    private renderMessage() {
        if (this.props.status === QueryStatus.NeverQueried) {
            if (this.props.isCollapsed) {
                return (
                    <div>
                        <Icon name="expand arrows alternate" style={styles.toggle}
                              onClick={() => this.props.onToggleCollapsed()}/>
                        <span style={{paddingLeft: "6px"}}>Expand to perform a query</span>
                    </div>

                )
            } else {
                return null;
            }
        }

        if (this.props.status === QueryStatus.Loading) {
            return (
                <div>
                    <span style={{paddingRight: "8px"}}>
                            <div style={spinnerStyle}/>
                    </span>
                    Query in progress...
                </div>
            );
        } else {
            if (this.props.neuronSystemCount === 0) {
                return null;
            }

            if (this.props.queryDuration >= 0) {
                const duration = (this.props.queryDuration / 1000);

                let matched = `Matched ${this.props.neuronMatchCount} of ${this.props.neuronSystemCount} reconstructions`;

                matched += ` in ${duration.toFixed(3)} ${duration === 1 ? "second" : "seconds"}`;
                console.log(matched)
                return (<span>{matched}</span>);
            } else {
                return null;
            }
        }
    }

    private renderButtons() {
        return (
            <div>
                <Button size="mini" inverted icon="plus" content="Add Filter"
                        disabled={this.props.status === QueryStatus.Loading}
                        onClick={() => this.props.predicates.addPredicate()}/>
                <Button size="mini" inverted icon="search" content="Search"
                        disabled={this.props.status === QueryStatus.Loading}
                        onClick={() => this.props.onPerformQuery()}/>
            </div>
        );
    }

    public render() {
        return (
            <div style={{
                backgroundColor: primaryBackground,
                color: "white",
                height: "30px",
                minHeight: "40px",
                width: "100%",
                margin: 0,
                padding: "6px",
                display: "flex",
                order: 1,
                flexDirection: "row",
                verticalAlign: "middle"
            }}>
                <div style={{order: 1, flexGrow: 0, flexShrink: 0}}>
                    {this.renderToggleButton()}
                </div>
                <div style={{order: 2, flexGrow: 1, flexShrink: 1, marginLeft: "10px"}}>
                    <div style={styles.message}>
                        {this.renderMessage()}
                    </div>
                </div>
                <div style={{order: 3, flexGrow: 0, flexShrink: 0}}>
                    {this.renderButtons()}
                </div>
            </div>
        );
    }
}
