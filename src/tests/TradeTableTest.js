var TradeTable = require("./../TradeTable.js");
var Trader = require("./../Trader.js");
var timestamp = require('unix-timestamp');
const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();
var MACD = require('technicalindicators').MACD;
var jsonQuery = require('json-query');
var fs = require("fs");
var jsonQuery = require('json-query')





var gdaxData1 = [
  [1512752400,13150.0,13478.99,13478.99,1,23.766734420000112],
  [1512753300,13250.0,13369.13,13285.0,2,21.92582883000003],
  [1512754200,13250.0,13369.12,13337.99,3,19.859693460000006],
  [1512755100,13197.23,13300.0,13295.69,4,21.013139410000022],
  [1512756000,13167.7,13299.99,13198.85,13169.53,21.153042180000035]
]


//nächste Schritte
//1. MFI
//3. Trade Klasse anfangen: Trader(TradeTable, TradeRule){}

//Initialize TradeTable
var tradeTable1 = new TradeTable({name: "My Table", csvFilePath: './data/raw_gdax/training_15min_intervall_raw.csv', csvSeperator: "\t"});
console.log(tradeTable1.name);
tradeTable1.refreshIndicators();
tradeTable1.printTradeTable();

//load rule
var jsonFile = fs.readFileSync("./data/tradeRules/rule2.json");
var ruleObject = JSON.parse(jsonFile);

var backtestingTrader = new Trader({tradeTable: tradeTable1, tradeRule: ruleObject});
var tradedTable = backtestingTrader.performBacktestTrading(34, 100, 0.0025);
tradedTable.printTradeTable();

var buyRows = tradedTable.getBuyRows();
var sellRows = tradedTable.getSellRows();



tradedTable.saveTableToCSVFile('./data/tradeTableExports/tradeTable.csv', "\t");




console.log("Test");