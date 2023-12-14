import * as path from "path";

const dist = path.join(__dirname, "public");

module.exports = {
    entry: [
        "./client/index"
    ],

    output: {
        filename: 'bundle.js',
        path: dist,
        publicPath: '/'
    },

    mode: "development",

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
            {test: /\.css$/, use: 'style-loader'},
            {test: /\.css$/, use: 'css-loader'},
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

    devtool: 'inline-source-map'
};
