require("console-stamp")(console, {
  colors: {
    stamp: "yellow",
    label: "cyan",
    label: true,
    metadata: "green"
  }
});

const request = require("request-promise");
const xml2js = require("xml2js");
const colors = require("colors");
const cheerio = require("cheerio");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const config = require(path.join(__dirname, "config.json"));

const formattedProxies = [];

const text = fs.readFileSync("./proxies.txt", "utf-8"); // credit _luqy

const newLine = text.split("\r\n");

for (let i = 0; i < newLine.length; i++) {
  let splitProxy = newLine[i].split(":");
  if (splitProxy.length > 3) {
    formattedProxies.push(
      "https://" +
        splitProxy[2] +
        ":" +
        splitProxy[3] +
        "@" +
        splitProxy[0] +
        ":" +
        splitProxy[1]
    );
  } else {
    formattedProxies.push("http://" + splitProxy[0] + ":" + splitProxy[1]);
  }
}

/* ------------------------------------------------------------------ Proxy Support ---------------------------------------------------------------------------------- */
