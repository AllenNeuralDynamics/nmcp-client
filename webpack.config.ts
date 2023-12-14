import * as path from "path";

const src = path.join(__dirname, "client");
const dist = path.join(__dirname, "dist",  "public");

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
                type: 'asset/resource'
            },
            {
                test: /\.svg/,
                type: 'asset/resource'
            }
        ]
    },

    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devtool: "source-map"
};
