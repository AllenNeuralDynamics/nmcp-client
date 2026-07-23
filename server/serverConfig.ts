export type ServiceLocation = {
    hostname: string;
    port: number;
    endpoint: string;
}

export interface IServiceOptions {
    port: number;
    systemEndpoint: string;
    graphQLService: ServiceLocation;
    exportService: ServiceLocation;
    exportLimit: number;
    doiHandler: string;
    precomputedLocation: string;
    googleAnalyticsTag: string;
}

const configuration: IServiceOptions = {
    port: 5000,
    systemEndpoint: "/system",
    graphQLService: {
        hostname: "nmcp-api",
        port: 5000,
        endpoint: "/graphql"
    },
    exportService: {
        hostname: "nmcp-export",
        port: 5000,
        endpoint: "/export"
    },
    exportLimit: 20,
    doiHandler: "https://doi.org",
    precomputedLocation: "",
    googleAnalyticsTag: ""
};

function loadServerConfiguration() {
    const options = Object.assign({}, configuration);

    options.port = parseInt(process.env.NMCP_CLIENT_PORT) || options.port;

    options.graphQLService.hostname = process.env.NMCP_API_HOST || options.graphQLService.hostname;
    options.graphQLService.port = parseInt(process.env.NMCP_API_PORT) || options.graphQLService.port;

    options.exportService.hostname = process.env.NMCP_EXPORT_API_HOST || options.exportService.hostname;
    options.exportService.port = parseInt(process.env.NMCP_EXPORT_API_PORT) || options.exportService.port;
    options.exportLimit = parseInt(process.env.NMCP_CLIENT_EXPORT_LIMIT) || options.exportLimit;

    options.doiHandler =  process.env.NMCP_DOI_HANDLER || options.doiHandler;

    options.precomputedLocation = process.env.NMCP_PRECOMPUTED_OUTPUT || options.precomputedLocation;

    options.googleAnalyticsTag = process.env.NMCP_GOOGLE_ANALYTICS_TAG || options.googleAnalyticsTag;

    return options;
}

export const ServerConfiguration = loadServerConfiguration();
