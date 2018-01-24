var express = require('express');
var fs = require("fs");
var router = express.Router();
var TradeTable = require("./../src/TradeTable.js");
var Trader = require("./../src/Trader.js");
var jsonQuery = require('json-query');


var backtestingTradeTable = NaN;
var jsonFile = NaN;
var startingBudget = NaN;
var ruleObject = NaN;

function checkSignIn (req, res, next){
  if(req.session.user){
     next();     //If session exists, proceed to page
  } else {
     var err = new Error("Not logged in!");
     console.log(req.session.user);
     next(err);  //Error, trying to access unauthorized page!
  }
}

router.get('/', checkSignIn, function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.send('Backtesting routes...');
});

router.get('/loadTradeTableFromCSV', checkSignIn, function(req, res, next) {
  backtestingTradeTable = new TradeTable({name: "Historic Data", csvFilePath: './data/raw_gdax/training_15min_intervall_raw.csv', csvSeperator: "\t"});
  console.log(backtestingTradeTable.name);
  backtestingTradeTable.refreshIndicators();  


  res.render('backtesting/loadTradeTable', {Status: "Data was loaded successfully." });
});

router.get('/loadTradeTableFromGDAX_API', checkSignIn, function(req, res, next) {
  
  res.send("Not implemented yet");
  //res.render('backtesting/loadTradeTable', {Status: "Data was loaded successfully." });
});

router.get('/showTradeTable', checkSignIn, function(req, res, next) {
    

    //res.send("Historic Data loaded from file: " + backtestingTradeTable.data.intervalls);

    res.render('backtesting/showTradeTable', {TableName: backtestingTradeTable.name, TableRows: backtestingTradeTable.data.intervalls });
});

router.get('/runBacktesting', checkSignIn, function(req, res, next) {
  jsonFile = fs.readFileSync("./data/tradeRules/rule2.json");
  ruleObject = JSON.parse(jsonFile);
  startingBudget = 100;
  
  var trader = new Trader({tradeTable: backtestingTradeTable, tradeRule: ruleObject});
  backtestingTradeTable = trader.performBacktestTrading(34, startingBudget, 0.0025);
  
  backtestingTradeTable.printTradeTable();

  res.render('backtesting/tradeTradeTable', {Status: "Backtesting finished. Please open visual analysis."});

});

router.get('/showVisualAnalysis', checkSignIn, function(req, res, next) {
  
  var datetime = backtestingTradeTable.getColumnValues("datetime");
  var budget = [];
  var close = backtestingTradeTable.getColumnValues("close");
  var macd_histogram = backtestingTradeTable.getColumnValues("macd_histogram");
  var mfi = backtestingTradeTable.getColumnValues("mfi");
  var rsi = backtestingTradeTable.getColumnValues("rsi");
  
  var buyRows = backtestingTradeTable.getBuyRows();
  var sellRows = backtestingTradeTable.getSellRows();

  var buySignals_datetime = jsonQuery('buyRows.datetime', {data: {buyRows: buyRows}}).value;
  var buySignals_close = jsonQuery('buyRows.close', {data: {buyRows: buyRows}}).value;
  var buySignals_signal = jsonQuery('buyRows.signal', {data: {buyRows: buyRows}}).value;
  var sellSignals_datetime = jsonQuery('sellRows.datetime', {data: {sellRows: sellRows}}).value;
  var sellSignals_close = jsonQuery('sellRows.close', {data: {sellRows: sellRows}}).value;
  var sellSignals_signal = jsonQuery('sellRows.signal', {data: {sellRows: sellRows}}).value;

  var sellSignals_budget = jsonQuery('sellRows.budget', {data: {sellRows: sellRows}}).value;
  var sellSignals_profit = jsonQuery('sellRows.profit', {data: {sellRows: sellRows}}).value;

  //res.send("Historic Data loaded from file: " + backtestingTradeTable.data.intervalls);

  res.render('backtesting/showVisualAnalysis', {datetime_Array: datetime, 
                                    budget_Array: budget, 
                                    close_Array: close, 
                                    macd_histogram_Array: macd_histogram, 
                                    mfi_Array: mfi, 
                                    rsi_Array: rsi,
                                    buySignals_datetime_array: buySignals_datetime,
                                    buySignals_close_array: buySignals_close,
                                    buySignals_signal_array: buySignals_signal,
                                    sellSignals_datetime_array: sellSignals_datetime,
                                    sellSignals_close_array: sellSignals_close,
                                    sellSignals_signal_array: sellSignals_signal,
                                    sellSignals_budget_array: sellSignals_budget,
                                    sellSignals_profit_array: sellSignals_profit,
                                    startingBudget: startingBudget});
});

module.exports = router;
