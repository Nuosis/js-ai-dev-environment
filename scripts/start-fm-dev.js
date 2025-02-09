import open from "open";
import path from "path";

import { config } from "../widget.config.js";

const { widgetName, startDevScript, file, server } = config;

const fileUrl = `fmp://${server}/${file}?script=${startDevScript}&param=turnOn`;

// const thePath = path.join(__dirname, "../", "dist", "index.html");
// const params = { widgetName, thePath };
const url = fileUrl;
open(url);
