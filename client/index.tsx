import * as React from "react";
import * as ReactDOM from "react-dom";

import {App} from "./components/app/App";

import "rc-slider/assets/index.css";
import "../assets/style.css";

require("file-loader?name=index.html!../index.html");

import "neuroglancer/layer/enabled_frontend_modules.js";
import "neuroglancer/datasource/enabled_frontend_modules.js";

const rootEl = document.getElementById("root");

ReactDOM.render(
    <App/>, rootEl
);
