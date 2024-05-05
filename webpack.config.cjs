const path = require("path");
const webpack = require('webpack');
const src = path.join(__dirname, "client");
const dist = path.join(__dirname, "dist", "public");
module.exports = {
    context: src,
    entry: [
        "./index"
    ],
    output: {
        filename: "bundle.js",
        path: dist
    },
    mode: "production",
    performance: {
        maxAssetSize: 4 * 1024 * 1024,
        maxEntrypointSize: 4 * 1024 * 1024,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/
            },
            { test: /\.css$/, use: "style-loader" },
            { test: /\.css$/, use: "css-loader" },
            {
                test: /\.png/,
                type: 'asset/resource'
            },
            {
                test: /\.svg/,
                type: 'asset/resource'
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
        fallback: { 'path': require.resolve('path-browserify') },
        extensions: [".tsx", ".ts", ".js"]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify("production")
        })
    ],
    devtool: "source-map"
};
//# sourceMappingURL=webpack.config.js.map
