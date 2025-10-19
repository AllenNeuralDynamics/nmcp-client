import * as React from "react";
import {Button, Group, Pagination, Slider, TextInput} from "@mantine/core";
import {IconArrowRight} from "@tabler/icons-react";

import {isNullOrUndefined} from "../../util/nodeUtil";

const MIN_PAGE_SIZE = 10;

export interface PaginationHeaderProps {
    total: number;
    value: number;
    limit: number;
    itemCount?: number;

    onChange(page: number): void;

    onLimitChange?(limit: number): void;
}

export function PaginationHeader(props: PaginationHeaderProps) {
    const [pageJumpText, setPageJumpText] = React.useState<string>(props.value.toFixed(0));
    const [isValidPageJump, setIsValidPageJump] = React.useState<boolean>(isValidJumpText(props.value.toFixed(0), props.total));
    const [limit, setLimit] = React.useState<number>(props.limit);

    const setActivePage = (page: number) => {
        props.onChange(page);
    };

    const onPageTextChanged = (value: string) => {
        const page = parseInt(value);
        const isValid = !isNaN(page) && (page > 0 && page <= props.total);
        setPageJumpText(value);
        setIsValidPageJump(isValid);
    };

    const onKeyPress = (evt: any) => {
        if (evt.charCode === 13 && isValidJumpText(evt.target.value, props.total)) {
            setActivePage(evt.target.value);
        }
    };

    const renderPageJump = () => {
        return (
            <Group gap={0}>
                <TextInput size="sm" radius="4 0 0 4" maw={80} error={!isValidPageJump} placeholder="Page..." value={pageJumpText}
                           onKeyUp={(e) => onKeyPress(e)}
                           onChange={event => onPageTextChanged(event.currentTarget.value)}/>
                <Button size="sm" bdrs="0 4 4 0" rightSection={<IconArrowRight size={18}/>} disabled={!isValidPageJump}
                        onClick={() => setActivePage(parseInt(pageJumpText))}>
                    Go
                </Button>
            </Group>
        );
    };

    const renderPagination = () => {
        return (
            <Pagination size="sm" withEdges={true} total={props.total} value={props.value} onChange={(page) => {
                setActivePage(page)
            }}/>
        );
    }

    if (!isNullOrUndefined(props.itemCount) && props.itemCount < MIN_PAGE_SIZE) {
        return null;
    }

    return (
        <Group justify="space-between" p={12} align="center">
            {props.onLimitChange ? (
                <Slider miw={300} mb={14} min={10} max={50} step={5} value={limit}
                        marks={[{value: 10, label: "10"}, {value: 20, label: "20"}, {value: 30, label: "30"}, {value: 40, label: "40"}, {
                            value: 50,
                            label: "50"
                        }]}
                        onChange={(value: number) => setLimit(value)}
                        onChangeEnd={(value: number) => props.onLimitChange(value)}/>
            ) : null}
            {props.total > 1 ? renderPagination() : null}
            {props.total > 1 ? renderPageJump() : null}
        </Group>
    );
}

function isValidJumpText(value: string, pageCount: number): boolean {
    const page = parseInt(value);
    return !isNaN(page) && (page > 0 && page <= pageCount);
}
