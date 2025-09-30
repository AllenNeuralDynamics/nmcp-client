export type ServiceLocation = {
    hostname: string;
    port: number;
    endpoint: string;
}

export interface IServiceOptions {
    port: number;
    systemEndpoint: string;
    graphQLService: ServiceLocation;
    staticService: ServiceLocation;
    exportService: ServiceLocation;
    exportLimit: number;
    precomputedLocation: string;
}

const configuration: IServiceOptions = {
    port: 5000,
    systemEndpoint: "/system",
    graphQLService: {
        hostname: "nmcp-api",
        port: 5000,
        endpoint: "/graphql"
    },
    staticService: {
        hostname: "nmcp-static",
        port: 5000,
        endpoint: "/static",
    },
    exportService: {
        hostname: "nmcp-export",
        port: 5000,
        endpoint: "/export"
    },
    exportLimit: 20,
    precomputedLocation: ""
};

function loadServerConfiguration() {
    const options = Object.assign({}, configuration);

    options.port = parseInt(process.env.NMCP_CLIENT_PORT) || options.port;

    options.graphQLService.hostname = process.env.NMCP_API_HOST || options.graphQLService.hostname;
    options.graphQLService.port = parseInt(process.env.NMCP_API_PORT) || options.graphQLService.port;

    options.staticService.hostname = process.env.STATIC_API_HOST || options.staticService.hostname;
    options.staticService.port = parseInt(process.env.STATIC_API_PORT) || options.staticService.port;

    options.exportService.hostname = process.env.EXPORT_API_HOST || options.exportService.hostname;
    options.exportService.port = parseInt(process.env.EXPORT_API_PORT) || options.exportService.port;

    options.exportLimit = parseInt(process.env.NMCP_CLIENT_EXPORT_LIMIT) || options.exportLimit;

    options.precomputedLocation = process.env.NMCP_PRECOMPUTED_OUTPUT || options.precomputedLocation;

    return options;
}

export const ServerConfiguration = loadServerConfiguration();
