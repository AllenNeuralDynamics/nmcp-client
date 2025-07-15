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

    onShare(): void;
}

export function QueryHeader(props: IQueryHeaderBaseProps) {
    const renderToggleButton = () => {
        if (props.status === QueryStatus.Loading) {
            return null;
        }

        return (
            <Button size="mini" inverted icon="remove circle" content="Reset" onClick={() => props.onResetPage()}/>
        )
    }

    const renderMessage = () => {
        if (props.status === QueryStatus.NeverQueried) {
            if (props.isCollapsed) {
                return (
                    <div>
                        <Icon name="expand arrows alternate" style={styles.toggle}
                              onClick={() => props.onToggleCollapsed()}/>
                        <span style={{paddingLeft: "6px"}}>Expand to perform a query</span>
                    </div>

                )
            } else {
                return null;
            }
        }

        if (props.status === QueryStatus.Loading) {
            return (
                <div>
                    <span style={{paddingRight: "8px"}}>
                            <div style={spinnerStyle}/>
                    </span>
                    Query in progress...
                </div>
            );
        } else {
            if (props.neuronSystemCount === 0) {
                return null;
            }

            if (props.queryDuration >= 0) {
                const duration = (props.queryDuration / 1000);

                let matched = `Matched ${props.neuronMatchCount} of ${props.neuronSystemCount} reconstructions`;

                matched += ` in ${duration.toFixed(3)} ${duration === 1 ? "second" : "seconds"}`;
                return (<span>{matched}</span>);
            } else {
                return null;
            }
        }
    }

    const renderButtons = () => {
        return (
            <div>
                <Button size="mini" inverted icon="share" content="Share"
                        disabled={props.status === QueryStatus.Loading}
                        onClick={() => props.onShare()}/>
                <Button size="mini" inverted icon="plus" content="Add Filter"
                        disabled={props.status === QueryStatus.Loading}
                        onClick={() => props.predicates.addPredicate()}
                        style={{marginLeft: "4px"}}/>
                <Button size="mini" inverted icon="search" content="Search"
                        disabled={props.status === QueryStatus.Loading}
                        onClick={() => props.onPerformQuery()}
                        style={{marginLeft: "4px"}}/>
            </div>
        );
    }

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
                {renderToggleButton()}
            </div>
            <div style={{order: 2, flexGrow: 1, flexShrink: 1, marginLeft: "10px"}}>
                <div style={styles.message}>
                    {renderMessage()}
                </div>
            </div>
            <div style={{order: 3, flexGrow: 0, flexShrink: 0}}>
                {renderButtons()}
            </div>
        </div>
    );
}
