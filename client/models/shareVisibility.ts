export enum ShareVisibility {
    DoNotShare = 0,
    Inherited = 0x01,
    ShareAllInternal = 0x02,
    ShareAllExternal = 0x04
}

export interface IShareVisibilityOption {
    key: ShareVisibility;
    value: ShareVisibility;
    text: string;
}

const ShareVisibilityOptions: IShareVisibilityOption[] = [
    {
        key: ShareVisibility.DoNotShare,
        value: ShareVisibility.DoNotShare,
        text: "Not shared"
    },
    {
        key: ShareVisibility.Inherited,
        value: ShareVisibility.Inherited,
        text: "Inherited"
    },
    {
        key: ShareVisibility.ShareAllInternal,
        value: ShareVisibility.ShareAllInternal,
        text: "Internal"
    },
    {
        key: ShareVisibility.ShareAllExternal,
        value: ShareVisibility.ShareAllExternal,
        text: "Public"
    }
];

function FilterNeuronVisibilityOptions(): IShareVisibilityOption[] {
    return ShareVisibilityOptions;
}

export const NeuronVisibilityOptions = FilterNeuronVisibilityOptions();

function FilterSampleVisibilityOptions(): IShareVisibilityOption[] {
    return ShareVisibilityOptions.filter(s => s.key !== ShareVisibility.Inherited);
}

export const SampleVisibilityOptions = FilterSampleVisibilityOptions();

export function FindVisibilityOption(id: number): IShareVisibilityOption {
    switch (id) {
        case ShareVisibility.Inherited:
            return ShareVisibilityOptions[1];
        case ShareVisibility.ShareAllInternal:
            return ShareVisibilityOptions[2];
        case ShareVisibility.ShareAllExternal:
            return ShareVisibilityOptions[3];
    }

    return ShareVisibilityOptions[0];
}
