var tradeTable = require("./src/TradeTable.js");
var downloader = require("./src/Downloader.js");

//initialize results table
var resultsTable = new tradeTable({name: "GDAX Results"});

options = {
    intervalLengthSeconds: 900,
    maxIntervallsPerDownload: 350,
    historyLengthDays: 30,
    resultsTable: resultsTable
}

var downloader = new Downloader(options);

downloader.initialDownload();