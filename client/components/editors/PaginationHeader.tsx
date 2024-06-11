import * as React from "react";
import {Input, Pagination, Table} from "semantic-ui-react";

const Slider = require("rc-slider").default;

export interface IPaginationHeaderProps {
    pageCount: number;
    activePage: number;
    limit: number;

    onUpdateOffsetForPage(page: number): void;
    onUpdateLimitForPage(limit: number): void;
}

export interface IPaginationHeaderState {
    pageJumpText?: string;
    isValidPageJump?: boolean;
    limit?: number;
}

export class PaginationHeader extends React.Component<IPaginationHeaderProps, IPaginationHeaderState> {
    public constructor(props: IPaginationHeaderProps) {
        super(props);

        const pageJumpText = props.activePage.toFixed(0);

        this.state = {
            pageJumpText,
            isValidPageJump: isValidJumpText(pageJumpText, props.pageCount),
            limit: props.limit
        }
    }

    private setActivePage(value: string) {
        const page = parseInt(value);
        this.props.onUpdateOffsetForPage(page);
    }

    private onPageTextChanged(value: string) {
        const page = parseInt(value);
        const isValid = !isNaN(page) && (page > 0 && page <= this.props.pageCount);
        this.setState({pageJumpText: value, isValidPageJump: isValid});
    }

    private onKeyPress(evt: any) {
        if (evt.charCode === 13 && isValidJumpText(evt.target.value, this.props.pageCount)) {
            this.setActivePage(evt.target.value);
        }
    }

    public componentWillReceiveProps(props: IPaginationHeaderProps) {
        this.setState({
            limit: props.limit,
            isValidPageJump: isValidJumpText(props.activePage.toFixed(0), props.pageCount)
        });
    }

    private renderPageJump() {
        if (this.props.pageCount > 1) {
            const action = {
                color: "blue",
                content: "Go",
                labelPosition: "right",
                icon: "chevron right",
                size: "mini",
                disabled: !this.state.isValidPageJump,
                onClick: () => this.setActivePage(this.state.pageJumpText)
            };

            return (
                <Input size="mini" action={action} error={!this.state.isValidPageJump} type="text" placehoder="Page..."
                       value={this.state.pageJumpText}
                       onKeyPress={(e: Event) => this.onKeyPress(e)}
                       onChange={(e, {value}) => this.onPageTextChanged(value)}/>
            );
        } else {
            return null;
        }
    }

    private renderPagination() {
        if (this.props.pageCount > 1) {
            return (
                <Pagination size="mini" totalPages={this.props.pageCount}
                            activePage={this.props.activePage}
                            onPageChange={(e, {activePage}) => {
                                this.setActivePage(activePage.toString())
                            }}/>
            );
        } else {
            return null;
        }
    }

    public render() {
        return (
            <Table style={{border: "none", background: "transparent"}}>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell style={{width: "33%", paddingTop: 0}}>
                            <Slider min={10} max={50} step={5} value={this.state.limit} style={{maxWidth: "300px"}}
                                    marks={{10: "10", 20: "20", 30: "30", 40: "40", 50: "50"}}
                                    onChange={(value: number) => this.setState({limit: value})}
                                    onAfterChange={(value: number) => this.props.onUpdateLimitForPage(value)}/>
                        </Table.Cell>

                        <Table.Cell style={{width: "34%"}} textAlign="center">
                            {this.renderPagination()}
                        </Table.Cell>

                        <Table.Cell style={{width: "33%", paddingRight: "1px"}} textAlign="right">
                            {this.renderPageJump()}
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        );
    }
}

function isValidJumpText(value: string, pageCount: number): boolean {
    const page = parseInt(value);
    return !isNaN(page) && (page > 0 && page <= pageCount);
}
