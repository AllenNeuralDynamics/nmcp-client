export interface IQueryOperator {
    id: string;
    display: string;
    operator: string;
}

export function displayQueryOperator(queryOperator: IQueryOperator): string {
    return queryOperator ? queryOperator.display : "(none)";
}
