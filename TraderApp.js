var tradeTable = require("./src/TradeTable.js");
var downloader = require("./src/Downloader");

//initialize results table
var resultsTable = new tradeTable({name: "GDAX Results"});

options = {
    intervalLengthSeconds: 900,
    maxIntervallsPerDownload: 350,
    historyLengthDays: 30,
    results: resultsTable
}

var downloader = new downloader(options);

downloader.initialDownload();