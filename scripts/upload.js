import open from "open";
import path from "path";

import { config } from "../widget.config.js";

const { widgetName, uploadScript, file, server } = config;

// console.log(config);
// console.log(widgetName, uploadScript, file, server);

// using node >=20.11
const __dirname = import.meta.dirname;

const fileUrl = `fmp://${server}/${file}?script=${uploadScript}&param=`;

const thePath = path.join(__dirname, "../", "dist", "index.html");
const params = { widgetName, thePath };
const url = fileUrl + encodeURIComponent(JSON.stringify(params));
open(url);
