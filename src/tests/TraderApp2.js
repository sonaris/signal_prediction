var Gdax = require('gdax');
var publicClient = new Gdax.PublicClient();
var tradeTable = require("../TradeTable.js");
var downloader = require("./../Downloader.js");

 
var tradeTable = new tradeTable({name: "GDAX Results"});;

var downloader = new downloader({
        intervalLengthSeconds: 900,
        maxIntervals: 350,
        maxHistoryDays: 30,
});

downloader.startInitalDownload(function(data) {
    data = data.reverse();
    tradeTable.appendGDAXData(data);
    tradeTable.printTradeTable();
});


