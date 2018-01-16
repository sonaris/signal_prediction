<<<<<<< HEAD:src/tests/TraderApp.js
var tradeTable = require("./../TradeTable.js");
var downloader = require("./../Downloader.js");
=======
var tradeTable = require("./src/TradeTable.js");
var downloader = require("./src/Downloader");
>>>>>>> 411eb512daf8b5f0c1b1ee746d301242a4ab5840:TraderApp.js

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