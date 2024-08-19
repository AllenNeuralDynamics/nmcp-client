const path = require("path");
const webpack = require('webpack');

module.exports = {
    extends: path.resolve(__dirname, "./base.webpack.config.cjs"),
    plugins: [
        new webpack.DefinePlugin({
            'process.env.AUTH_ENV': JSON.stringify("staging")
        })
    ]
};
//# sourceMappingURL=webpack.staging.config.js.map
