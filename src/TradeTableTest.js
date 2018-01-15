var TradeTable = require("./TradeTable.js");
var timestamp = require('unix-timestamp');
const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();
var MACD = require('technicalindicators').MACD;
var jsonQuery = require('json-query');




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
tradeTable1.printTradeTable();

tradeTable1.refreshIndicators();

tradeTable1.printTradeTable();

tradeTable1.saveTableToCSVFile('./data/tradeTableExports/tradeTable.csv', "\t");



var tradeRule = {
  buy: {
    or: [
      [ 
        {type: "comparison", column: "MACD_histogram_slopePercentage_extrems", operator: "==", value: "min"},
        {type: "comparison", column: "MFI", operator: "<", value: 30},
        {type: "comparison", column: "MACD_histogram", operator: "<", value: 30}
      ],
      [
        {type: "comparison", column: "MFI", operator: "<", value: 10}
      ],
      [
        {type: "comparison", column: "MACD_histogram", operator: "<", value: -100}
      ]
    ]
  },
  sell: {
    or: [
      [
        {type: "comparison", column: "MACD_histogram", operator: ">", value: 50},
        {type: "comparison", column: "MACD_histogram_slopePercentage", operator: "<", value: 0.2},
        {type: "comparison", column: "MFI", operator: ">", value: 60}
      ],
      [
        {type: "comparison", column: "MFI", operator: ">=", value: 90}
      ],
      [
        {type: "calculationWithVariableAndComparison", column: "MFI", operator1: "-", variable: "MFI_ValueAtBuy", operator2: ">", value: 43}
      ]
    ],
    limitLoss : {active: false, acceptableLossInPercent: 0.05},
    profitSafeguard : {active: false, dailyPercentageOfProfit: 0.5}
  }
  
  
}

console.log("Test");