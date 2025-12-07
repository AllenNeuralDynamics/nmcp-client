import * as path from "path";
import webpack from "webpack";

// @ts-ignore
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "public");

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pathName = require.resolve("path-browserify");

export const webpackConfig = {
    entry: [
        "./client/index"
    ],

    output: {
        filename: "bundle.js",
        path: dist,
        publicPath: "/"
    },

    mode: "development",

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/
            },
            {test: /\.css$/, use: "style-loader"},
            {test: /\.css$/, use: "css-loader"},
            {
                test: /\.png/,
                type: "asset/resource"
            },
            {
                test: /\.svg/,
                type: "asset/resource"
            },
            // Needed for .svg?raw imports used for embedding icons.
            {
                resourceQuery: /raw/,
                type: "asset/source",
            },
            // Needed for .html?url imports used for auth redirect pages for the
            // brainmaps and bossDB data sources.  Can be skipped if those data
            // sources are excluded.
            {
                test: /\.html$/,
                resourceQuery: /url/,
                type: "asset/resource",
                generator: {
                    // Filename must be preserved since exact redirect URLs must be allowlisted.
                    filename: "[name][ext]",
                },
            }
        ]
    },

    resolve: {
        fallback: { "path": pathName },
        extensions: [".tsx", ".ts", ".js"]
    },

    plugins: [
        new webpack.DefinePlugin({
            "process.env.AUTH_ENV": JSON.stringify("development")
        })
    ],

    devtool: "eval-source-map"
};
