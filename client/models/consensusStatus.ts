export enum ConsensusStatus {
    Full,
    Partial,
    Single,
    Pending,
    None
}

export interface IConsensusStatusOption {
    key: ConsensusStatus;
    value: ConsensusStatus;
    text: string;
}

export const ConsensusStatusOptions: IConsensusStatusOption[] = [
    {
        key: ConsensusStatus.Full,
        value: ConsensusStatus.Full,
        text: "Full"
    },
    {
        key: ConsensusStatus.Single,
        value: ConsensusStatus.Single,
        text: "Single"
    }
];

export function FindConsensusStatusOption(id: number): IConsensusStatusOption {
    switch (id) {
        case ConsensusStatus.Full:
            return ConsensusStatusOptions[0];
        case ConsensusStatus.Partial:
            return ConsensusStatusOptions[0];
        case ConsensusStatus.Single:
            return ConsensusStatusOptions[1];
        case ConsensusStatus.Pending:
            return ConsensusStatusOptions[0];
        case ConsensusStatus.None:
            return ConsensusStatusOptions[0];
    }

    return ConsensusStatusOptions[0];
}