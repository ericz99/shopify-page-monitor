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
const sites = config.app.sites;

const formattedProxies = [];

const text = fs.readFileSync("./proxies.txt", "utf-8");

const newLine = text.split("\r\n");

/* UPDATE! */
/*
  - Password Page Monitor - DONE!
  - Product Monitor - NOT DONE!
*/

/* Credit to _luqy for this way of formatting proxies ~ got to lazy to do it myself so yeah. */
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

const randomProxies = formattedProxies.length > 0 ? formattedProxies[Math.floor(Math.random() * formattedProxies.length)] : null

/* GLOBAL HEADERS */
let headers = {
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'en-US,en;q=0.9',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive'
}


/* ------------------------------------------------------------------ Proxy Support ---------------------------------------------------------------------------------- */

try {
  let resultObj = {};

  function monitorPage() {
    console.log("Starting monitor...")
    for (let i = 0; i < sites.length; i++) {
      let opts = {
        method: 'get',
        uri: sites[i],
        gzip: true,
        followRedirect: true,
        resolveWithFullResponse: true,
        headers: {
          'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
        }
      }

      request(opts)
        .then(res => {
          /* Our object to store */
          return resultObj[res.request.host] = {
            href: res.request.href,
            path: res.request.path
          }
        }).catch(err => {
          if (err) {
            console.log(err)
          }
        })
    }
  }

  monitorPage();

  function startMonitor() {
    setTimeout(() => {
      for (let i = 0; i < sites.length; i++) {
        let opts = {
          method: 'GET',
          uri: sites[i],
          gzip: true,
          followRedirect: true,
          resolveWithFullResponse: true,
          headers: headers
        }

        request(opts)
          .then(res => {
            if (res.statusCode == 200) {
              if (resultObj[res.request.host].path === res.request.path) {
                console.log('scanning... password page is still up or down..')
              } else {
                /* Send Webhook */
                let opts = {
                  url: config.webhook,
                  method: 'POST',
                  headers: headers,
                  json: {
                    "embeds": [{
                      "title": `${res.request.href}`,
                      "color": 1768289,
                      "footer": {
                        "text": "Password Monitor"
                      },

                      "fields": [
                        {
                          "name": "Password Page",
                          "value": res.request.path == "/password" ? "PASSWORD PAGE UP!!!" : "PASSWORD PAGE DOWN!!!",
                          "inline": true
                        },
                      ]
                    }]
                  }
                }
                request(opts)
                console.log("Sent hook!")

                /* restart monitor - to update the cycle */
                return monitorPage()
              }
            } else {
              console.log("ERROR: - Connection issues...")
            }
          }).catch(err => {
            if (err) {
              console.log(err)
            }
          })
      }
      startMonitor()
    }, config.interval)
  }

  startMonitor();

} catch (err) {
  if (err) {
    console.log(err);
  }
}