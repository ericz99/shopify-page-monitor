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

function formatProxy(proxy) {
  if (proxy && ["localhost", ""].indexOf(proxy) < 0) {
    let splitProxy = proxy.split(":");
    if (splitProxy.length > 3) {
    }
  }
}
