import {DefaultPagination, PageSettingsDefinition, PageSettingsKeys, PaginationSettings, sanitizePagination} from "../../util/pageSettings";
import {
    BrightnessBounds,
    CandidateFilterSettings,
    DefaultCandidateFilterSettings,
    OptionalFilterSettings,
    sanitizeRangeFilter,
    VolumeBounds
} from "../../viewmodel/candidateFilter";
import {NeuronStatus} from "../../models/neuron";

export type AddSpecimensSpecimensSettings = {
    pagination: PaginationSettings;
    create: {
        atlasId: string | null;
        collectionId: string | null;
    };
}

export type AddSpecimensNeuronsFilterSettings = Pick<CandidateFilterSettings, "specimens" | "atlasStructures" | "keywords" | "brightness" | "volume"> & {
    status: OptionalFilterSettings<NeuronStatus>;
}

export type AddSpecimensNeuronsSettings = {
    filters: AddSpecimensNeuronsFilterSettings;
    pagination: PaginationSettings;
    lockedSpecimenId: string | null;
}

export type AddSpecimensPageSettings = {
    version: number;
    specimens: AddSpecimensSpecimensSettings;
    neurons: AddSpecimensNeuronsSettings;
}

const neuronStatuses = [NeuronStatus.Unpublished, NeuronStatus.Published];

const {specimens, atlasStructures, keywords, brightness, volume} = DefaultCandidateFilterSettings;

export const AddSpecimensSettings: PageSettingsDefinition<AddSpecimensPageSettings> = {
    key: PageSettingsKeys.addSpecimens,
    defaults: {
        version: 1,
        specimens: {
            pagination: DefaultPagination,
            create: {atlasId: null, collectionId: null}
        },
        neurons: {
            filters: {specimens, atlasStructures, keywords, brightness, volume, status: {enabled: false, contents: NeuronStatus.Unpublished}},
            pagination: DefaultPagination,
            lockedSpecimenId: null
        }
    },
    sanitize: settings => ({
        ...settings,
        specimens: {...settings.specimens, pagination: sanitizePagination(settings.specimens.pagination)},
        neurons: {
            ...settings.neurons,
            filters: {
                ...settings.neurons.filters,
                brightness: sanitizeRangeFilter(settings.neurons.filters.brightness, BrightnessBounds),
                volume: sanitizeRangeFilter(settings.neurons.filters.volume, VolumeBounds),
                status: {
                    ...settings.neurons.filters.status,
                    contents: neuronStatuses.includes(settings.neurons.filters.status.contents) ? settings.neurons.filters.status.contents : NeuronStatus.Unpublished
                }
            },
            pagination: sanitizePagination(settings.neurons.pagination)
        }
    })
};
