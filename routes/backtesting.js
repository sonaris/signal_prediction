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

router.get('/table', function(req, res, next) {
    

    //res.send("Historic Data loaded from file: " + backtestingTradeTable.data.intervalls);

    res.render('table', {TableName: backtestingTradeTable.name, TableRows: backtestingTradeTable.data.intervalls });
});

router.get('/charts', function(req, res, next) {
    

  //res.send("Historic Data loaded from file: " + backtestingTradeTable.data.intervalls);

  res.render('charts', {});
});

module.exports = router;
