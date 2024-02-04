import * as path from "path";
import * as fs from "fs";

const express = require("express");
const proxy = require("express-http-proxy");

const debug = require("debug")("mnb:search-client:app");

import {ServerConfiguration} from "./serverConfig";
import {SearchScope} from "./searchScope";

const version = readSystemVersion();

debug(`search scope will limited to ${SearchScope[ServerConfiguration.searchScope]}`);

const apiUri = `http://${ServerConfiguration.graphQLService.hostname}:${ServerConfiguration.graphQLService.port}`;
const tracingsUri = `http://${ServerConfiguration.tracingsService.hostname}:${ServerConfiguration.tracingsService.port}`;
const staticUri = `http://${ServerConfiguration.staticService.hostname}:${ServerConfiguration.staticService.port}`;
const exportUri = `http://${ServerConfiguration.exportService.hostname}:${ServerConfiguration.exportService.port}`;

let app = null;

const maintainBaseUrl = req => req.baseUrl;

if (process.env.NODE_ENV !== "production") {
    app = devServer();
} else {
    debug("configuring production express server");

    const rootPath = path.resolve(path.join(__dirname, "public"));

    app = express();

    app.use(ServerConfiguration.systemEndpoint, (req, res) => {
        res.json({
            systemVersion: version,
            searchScope: ServerConfiguration.searchScope,
            exportLimit: ServerConfiguration.exportLimit
        });
    });

    // For most deployments the following are intercepted by an nginx instance to load balance between multiple backend
    // instances.  However, there may be certain client instances where these endpoints are used directly.

    debug(`proxying ${ServerConfiguration.graphQLService.endpoint} to ${apiUri}`);
    app.use(`${ServerConfiguration.graphQLService.endpoint}`, proxy(`${apiUri}`, {
        proxyReqPathResolver: maintainBaseUrl, proxyReqOptDecorator: (proxyReqOpts: any) => {
            proxyReqOpts.headers.Authorization = ServerConfiguration.authClientId;
            return proxyReqOpts;
        }
    }));

    debug(`proxying ${ServerConfiguration.tracingsService.endpoint} to ${tracingsUri}`);
    app.use(`${ServerConfiguration.tracingsService.endpoint}`, proxy(`${tracingsUri}`, {proxyReqPathResolver: maintainBaseUrl}));

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
}

app.listen(ServerConfiguration.port, "0.0.0.0", () => {
    if (process.env.NODE_ENV !== "production") {
        debug(`listening at http://localhost:${ServerConfiguration.port}/`);
    }
});

function devServer() {
    const webpackConfig = require("../webpack.dev.config.js");
    const Webpack = require("webpack");
    const webpackDevServer = require("webpack-dev-server");
    const compiler = Webpack(webpackConfig);

    return new webpackDevServer(compiler, {
        proxy: {
            [ServerConfiguration.graphQLService.endpoint]: {
                target: apiUri,
                headers: {"Authorization": ServerConfiguration.authClientId}
            },
            [ServerConfiguration.tracingsService.endpoint]: {
                target: tracingsUri
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
        onBeforeSetupMiddleware: (devserver) => {
            devserver.app.use(ServerConfiguration.systemEndpoint, (req, res) => {
                res.json({
                    systemVersion: version,
                    searchScope: ServerConfiguration.searchScope,
                    exportLimit: ServerConfiguration.exportLimit
                });
            });
        },
        devMiddleware: {
            publicPath: webpackConfig.output.publicPath,
            stats: {
                colors: true
            }
        }
    });
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