import * as React from "react";
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Table} from "@mantine/core";

import {CandidatePlaceholderRow, CandidateRow, CandidateRowHeight, candidateColumnCount} from "./CandidateRow";
import {NeuronShape} from "../../models/neuron";

const OverscanRows = 10;

const HeaderRowCount = 2;

export type CandidatesTableHandle = {
    scrollToRow(offset: number): void;
    scrollToTop(): void;
}

export interface CandidatesTableProps {
    totalCount: number;
    visibleRowCount: number;
    rowAt(offset: number): NeuronShape | undefined;
    // Changes whenever the buffered rows do, so the table re-renders for rows that arrive.
    version: number;
    showAnnotators: boolean;
    selectedId: string | null;

    onSelected(neuron: NeuronShape): void;

    onRangeChange(first: number, last: number): void;
}

export const CandidatesTable = forwardRef<CandidatesTableHandle, CandidatesTableProps>((props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [scrollTop, setScrollTop] = useState(0);

    const viewportRows = Math.min(props.visibleRowCount, props.totalCount);
    const maxFirst = Math.max(0, props.totalCount - viewportRows);

    // The sticky header covers exactly its own height at the top of the viewport, so no offset term is needed.
    const first = Math.min(Math.floor(scrollTop / CandidateRowHeight), maxFirst);
    const last = Math.min(props.totalCount - 1, first + viewportRows - 1);

    useEffect(() => {
        props.onRangeChange(first, last);
    }, [first, last]);

    // State is set alongside scrollTop because a programmatic scroll's event arrives asynchronously.
    const scrollTo = (top: number) => {
        if (containerRef.current) {
            containerRef.current.scrollTop = top;
        }

        setScrollTop(top);
    };

    useImperativeHandle(ref, () => ({
        scrollToRow(offset: number) {
            if (offset >= first && offset <= last) {
                return;
            }

            const target = Math.max(0, Math.min(maxFirst, offset - Math.floor((viewportRows - 1) / 2)));

            scrollTo(target * CandidateRowHeight);
        },
        scrollToTop() {
            scrollTo(0);
        }
    }), [first, last, maxFirst, viewportRows]);

    const columnCount = candidateColumnCount(props.showAnnotators);

    const start = Math.max(0, first - OverscanRows);
    const end = Math.min(props.totalCount - 1, last + OverscanRows);

    const rows: React.ReactNode[] = [];

    for (let offset = start; offset <= end; offset++) {
        const neuron = props.rowAt(offset);

        rows.push(neuron ?
            <CandidateRow key={neuron.id} neuron={neuron} isSelected={neuron.id == props.selectedId} showAnnotators={props.showAnnotators}
                          onSelected={props.onSelected}/> :
            <CandidatePlaceholderRow key={`placeholder-${offset}`} columnCount={columnCount}/>);
    }

    const spacer = (rowCount: number, key: string) => rowCount > 0 ? (
        <tr key={key} aria-hidden="true" data-spacer={key} style={{height: rowCount * CandidateRowHeight}}>
            <td colSpan={columnCount} style={{padding: 0, border: 0}}/>
        </tr>
    ) : null;

    const headerRowStyle = {height: CandidateRowHeight};

    return (
        <div ref={containerRef} style={{height: (HeaderRowCount + viewportRows) * CandidateRowHeight, overflowY: "auto"}}
             onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
            <Table withColumnBorders layout="fixed" stickyHeader>
                <colgroup>
                    <col/>
                    <col/>
                    <col/>
                    <col/>
                    <col/>
                    <col style={{width: 80}}/>
                    <col style={{width: 80}}/>
                    <col style={{width: 80}}/>
                    <col style={{width: 200}}/>
                    {props.showAnnotators ? <col/> : null}
                </colgroup>
                <Table.Thead bg="table-header">
                    <Table.Tr style={headerRowStyle}>
                        <Table.Th rowSpan={2}>Neuron</Table.Th>
                        <Table.Th rowSpan={2}>Specimen</Table.Th>
                        <Table.Th rowSpan={2}>Genotype</Table.Th>
                        <Table.Th rowSpan={2}>Keywords</Table.Th>
                        <Table.Th colSpan={4} ta="center">Atlas Soma</Table.Th>
                        <Table.Th rowSpan={2} colSpan={1} ta="center">Specimen Soma (X, Y, Z)</Table.Th>
                        {props.showAnnotators ? <Table.Th rowSpan={2}>Annotator(s)</Table.Th> : null}
                    </Table.Tr>
                    <Table.Tr style={headerRowStyle}>
                        <Table.Th>Structure</Table.Th>
                        <Table.Th ta="center">X</Table.Th>
                        <Table.Th ta="center">Y</Table.Th>
                        <Table.Th ta="center">Z</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody bg="table">
                    {spacer(start, "top")}
                    {rows}
                    {spacer(props.totalCount - 1 - end, "bottom")}
                </Table.Tbody>
            </Table>
        </div>
    );
});
