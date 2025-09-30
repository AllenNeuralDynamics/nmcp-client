import * as path from "path";
import * as fs from "fs";

import express from "express";
import proxy from "express-http-proxy";

import {webpackConfig} from "./webpack.dev.config.js";
import pkg from "webpack";

const {webpack} = pkg;
import webpackDevServer from "webpack-dev-server";

import Debug from "debug";

const debug = Debug("nmcp:client:app");

import {ServerConfiguration} from "./serverConfig.js";

import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const version = readSystemVersion();

const apiUri = `http://${ServerConfiguration.graphQLService.hostname}:${ServerConfiguration.graphQLService.port}`;
const staticUri = `http://${ServerConfiguration.staticService.hostname}:${ServerConfiguration.staticService.port}`;
const exportUri = `http://${ServerConfiguration.exportService.hostname}:${ServerConfiguration.exportService.port}`;

const maintainBaseUrl = (req: { baseUrl: any; }) => req.baseUrl;

if (process.env.NODE_ENV !== "production") {
    devServer();
} else {
    debug("configuring production express server")

    debug(`using precomputed root ${ServerConfiguration.precomputedLocation}`);

    const rootPath = path.resolve(path.join(__dirname, "public"));

    const app = express();

    app.use(ServerConfiguration.systemEndpoint, (_, res) => {
        res.json({
            systemVersion: version,
            precomputedLocation: ServerConfiguration.precomputedLocation,
            exportLimit: ServerConfiguration.exportLimit
        });
    });

    // For most deployments the following are intercepted by an nginx instance to load balance between multiple backend
    // instances.  However, there may be certain client instances where these endpoints are used directly.

    debug(`proxying ${ServerConfiguration.graphQLService.endpoint} to ${apiUri}`);
    app.use(`${ServerConfiguration.graphQLService.endpoint}`, proxy(`${apiUri}`, {
        limit: "100mb",
        proxyReqPathResolver: maintainBaseUrl,
        proxyReqOptDecorator: (proxyReqOpts: any) => {
            return proxyReqOpts;
        }
    }));

    debug(`proxying ${ServerConfiguration.staticService.endpoint} to ${staticUri}`);
    app.use(`${ServerConfiguration.staticService.endpoint}`, proxy(`${staticUri}`, {proxyReqPathResolver: req => "/static" + req.url}));

    debug(`proxying /slice to ${staticUri}`);
    app.use(`/slice`, proxy(`${staticUri}`, {proxyReqPathResolver: req => "/slice" + req.url}));

    debug(`proxying ${ServerConfiguration.exportService.endpoint} to ${exportUri}`);
    app.use(`${ServerConfiguration.exportService.endpoint}`, proxy(`${exportUri}`, {proxyReqPathResolver: req => "/export" + req.url}));

    app.use(express.static(rootPath));

    app.use("/", (req, res) => {
        res.sendFile(path.join(rootPath, "index.html"));
    });

    app.listen(ServerConfiguration.port, "0.0.0.0", () => {
        if (process.env.NODE_ENV !== "production") {
            debug(`listening at http://localhost:${ServerConfiguration.port}/`);
        }
    });
}

function devServer() {
    debug("configuring webpack dev server");

    debug(`using precomputed root ${ServerConfiguration.precomputedLocation}`);

    // @ts-ignore
    const compiler = webpack(webpackConfig);

    const server = new webpackDevServer({
        proxy: {
            [ServerConfiguration.graphQLService.endpoint]: {
                target: apiUri
            },
            [ServerConfiguration.staticService.endpoint]: {
                target: staticUri
            },
            [ServerConfiguration.exportService.endpoint]: {
                target: exportUri
            },
            ["/slice"]: {
                target: staticUri
            }
        },
        allowedHosts: "all",
        setupMiddlewares: (middlewares, devServer) => {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }

            devServer.app.use(ServerConfiguration.systemEndpoint, (req, res) => {
                res.json({
                    systemVersion: version,
                    precomputedLocation: ServerConfiguration.precomputedLocation,
                    exportLimit: ServerConfiguration.exportLimit
                });
            });

            return middlewares;
        },
        devMiddleware: {
            publicPath: webpackConfig.output.publicPath,
            stats: {
                colors: true
            }
        },
        historyApiFallback: true,
        port: ServerConfiguration.port
    }, compiler);

    server.startCallback((err) => {
        if (err) {
            console.log(err);
        } else {
            debug(`listening at http://localhost:${ServerConfiguration.port}/`);
        }
    });

    return server;
}

function readSystemVersion(): string {
    try {
        const contents = JSON.parse(fs.readFileSync(path.resolve("package.json")).toString());
        debug(`system version set to ${contents.version}`);
        return contents.version;
    } catch (err) {
        console.log(err);
        return "";
    }
}
