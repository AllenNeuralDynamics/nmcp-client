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

export function PaginationHeader(props: IPaginationHeaderProps) {
    const [pageJumpText, setPageJumpText] = React.useState<string>(props.activePage.toFixed(0));
    const [isValidPageJump, setIsValidPageJump] = React.useState<boolean>(isValidJumpText(props.activePage.toFixed(0), props.pageCount));
    const [limit, setLimit] = React.useState<number>(props.limit);

    React.useEffect(() => {
        setLimit(props.limit);
        setIsValidPageJump(isValidJumpText(props.activePage.toFixed(0), props.pageCount));
    }, [props.limit, props.activePage, props.pageCount]);

    const setActivePage = (value: string) => {
        const page = parseInt(value);
        props.onUpdateOffsetForPage(page);
    };

    const onPageTextChanged = (value: string) => {
        const page = parseInt(value);
        const isValid = !isNaN(page) && (page > 0 && page <= props.pageCount);
        setPageJumpText(value);
        setIsValidPageJump(isValid);
    };

    const onKeyPress = (evt: any) => {
        if (evt.charCode === 13 && isValidJumpText(evt.target.value, props.pageCount)) {
            setActivePage(evt.target.value);
        }
    };

    const renderPageJump = () => {
        if (props.pageCount > 1) {
            const action = {
                color: "blue",
                content: "Go",
                labelPosition: "right",
                icon: "chevron right",
                size: "mini",
                disabled: !isValidPageJump,
                onClick: () => setActivePage(pageJumpText)
            };

            return (
                <Input size="mini" action={action} error={!isValidPageJump} type="text" placehoder="Page..."
                       value={pageJumpText}
                       onKeyPress={(e: Event) => onKeyPress(e)}
                       onChange={(e, {value}) => onPageTextChanged(value)}/>
            );
        } else {
            return null;
        }
    };

    const renderPagination = () => {
        if (props.pageCount > 1) {
            return (
                <Pagination size="mini" totalPages={props.pageCount}
                            activePage={props.activePage}
                            onPageChange={(e, {activePage}) => {
                                setActivePage(activePage.toString())
                            }}/>
            );
        } else {
            return null;
        }
    };

    return (
        <Table style={{border: "none", background: "transparent"}}>
            <Table.Body>
                <Table.Row>
                    <Table.Cell style={{width: "33%", paddingTop: 0}}>
                        <Slider min={10} max={50} step={5} value={limit} style={{maxWidth: "300px"}}
                                marks={{10: "10", 20: "20", 30: "30", 40: "40", 50: "50"}}
                                onChange={(value: number) => setLimit(value)}
                                onAfterChange={(value: number) => props.onUpdateLimitForPage(value)}/>
                    </Table.Cell>

                    <Table.Cell style={{width: "34%"}} textAlign="center">
                        {renderPagination()}
                    </Table.Cell>

                    <Table.Cell style={{width: "33%", paddingRight: "1px"}} textAlign="right">
                        {renderPageJump()}
                    </Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
    );
}

function isValidJumpText(value: string, pageCount: number): boolean {
    const page = parseInt(value);
    return !isNaN(page) && (page > 0 && page <= pageCount);
}
