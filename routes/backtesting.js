var express = require('express');
var router = express.Router();
var TradeTable = require("./../src/TradeTable.js");


var backtestingTradeTable = new TradeTable({name: "Historic Data", csvFilePath: './data/raw_gdax/training_15min_intervall_raw.csv', csvSeperator: "\t"});
console.log(backtestingTradeTable.name);
backtestingTradeTable.refreshIndicators();

router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.send('Backtesting routes...');
});

router.get('/tradeTable', function(req, res, next) {
    

    //res.send("Historic Data loaded from file: " + backtestingTradeTable.data.intervalls);

    res.render('backtesting/table', {TableName: backtestingTradeTable.name, TableRows: backtestingTradeTable.data.intervalls });
});

router.get('/visualAnalysis', function(req, res, next) {
  
  var datetime = backtestingTradeTable.getColumnValues("datetime");
  var budget = [];
  var close = backtestingTradeTable.getColumnValues("close");
  var macd_histogram = backtestingTradeTable.getColumnValues("macd_histogram");
  var mfi = backtestingTradeTable.getColumnValues("mfi");
  var rsi = backtestingTradeTable.getColumnValues("rsi");

  //res.send("Historic Data loaded from file: " + backtestingTradeTable.data.intervalls);

  res.render('backtesting/charts', {datetime_Array: datetime, budget_Array: budget, close_Array: close, macd_histogram_Array: macd_histogram, mfi_Array: mfi, rsi_Array: rsi});
});

module.exports = router;
