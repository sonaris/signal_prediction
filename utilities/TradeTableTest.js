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

var gdaxData2 = [
  [1512756900,13150.0,13478.99,13478.99,13285.0,23.766734420000112],
  [1512757800,13250.0,13369.13,13285.0,13337.99,21.92582883000003],
  [1512758700,13250.0,13369.12,13337.99,13295.7,19.859693460000006],
  [1512759600,13197.23,13300.0,13295.69,13198.85,21.013139410000022],
  [1512760500,13167.7,13299.99,13198.85,13169.53,21.153042180000035]
]

var gdaxData3 = [
[1512752400,13150.0,13478.99,13478.99,13285.0,23.766734420000112],
[1512753300,13250.0,13369.13,13285.0,13337.99,21.92582883000003],
[1512754200,13250.0,13369.12,13337.99,13295.7,19.859693460000006],
[1512755100,13197.23,13300.0,13295.69,13198.85,21.013139410000022],
[1512756000,13167.7,13299.99,13198.85,13169.53,21.153042180000035],
[1512756900,13100.0,13248.99,13169.07,13100.1,22.68114570000003],
[1512757800,13100.51,13235.0,13100.51,13235.0,27.739327080000155],
[1512758700,13234.99,13381.84,13235.0,13370.0,18.283321409999992],
[1512759600,13349.99,13649.0,13398.99,13647.82,30.907257980000082],
[1512760500,13370.0,13644.38,13644.38,13445.38,31.12149255000017],
[1512761400,13380.18,13491.73,13415.85,13389.99,26.464379930000057],
[1512762300,13271.19,13390.0,13390.0,13300.91,21.692318370000006],
[1512763200,13271.18,13380.0,13300.91,13339.0,22.949103390000012],
[1512764100,13266.92,13339.95,13339.0,13307.96,19.301286480000023],
[1512765000,13234.23,13323.38,13299.0,13234.23,28.831408990000124],
[1512765900,13100.05,13250.0,13241.7,13200.0,31.25508317000013],
[1512766800,13200.0,13380.0,13200.0,13309.05,20.633370529999986],
[1512767700,13290.02,13493.0,13309.05,13493.0,21.59029572000006],
[1512768600,13402.62,13499.99,13493.0,13493.0,20.09640157999999],
[1512769500,13493.0,13675.61,13493.0,13648.0,36.18452203000003],
[1512770400,13647.99,13798.0,13648.0,13748.96,34.325093780000095],
[1512771300,13654.66,13748.88,13748.0,13685.1,19.835092700000025],
[1512772200,13603.87,13687.43,13685.11,13640.15,18.273189839999986],
[1512773100,13639.99,13734.63,13640.14,13705.52,15.256980499999951],
[1512774000,13642.06,13738.0,13705.52,13652.36,11.784122439999958],
[1512774900,13651.35,13697.0,13674.45,13694.03,10.266710049999974],
[1512775800,13694.03,13700.0,13694.04,13700.0,20.054333840000034],
[1512776700,13699.99,13740.0,13700.0,13701.15,23.781118829999976],
[1512777600,13699.99,13776.3,13701.14,13771.01,12.561372409999981],
[1512778500,13769.96,13776.31,13771.01,13776.31,13.667161179999965],
[1512779400,13691.99,13776.31,13776.31,13697.57,15.218465349999981],
[1512780300,13650.02,13697.56,13697.56,13650.02,12.948397049999985],
[1512781200,13611.9,13650.02,13650.02,13613.42,5.981080859999985],
[1512782100,13523.68,13613.42,13613.42,13523.68,10.31769802999998],
[1512783000,13365.04,13523.68,13523.68,13498.94,9.600934039999983],
[1512783900,13345.67,13499.11,13498.94,13345.67,7.323249299999979],
[1512784800,13302.96,13448.92,13345.36,13415.0,15.490743229999975],
[1512785700,13415.0,13485.7,13415.0,13481.11,13.612800109999998],
[1512786600,13481.11,13499.94,13481.11,13499.94,11.357622469999999]
]

/*
var gdaxCallback = (error, response, data) => {
  if (error) {
  // handle the error
  } else {
  // work with data
  var myTable = new TradeTable("My Table");

  myTable.appendGDAXData(data);
  myTable.upsertColumn("datetime", myTable.getColumnValues("time").map(function(e) { return timestamp.toDate(e); }));
  
  myTable.upsertMACD_histogram("close");

  

   //print tabular representation of table
   myTable.printTradeTable();

  }
}

var gdaxData3 = publicClient.getProductHistoricRates('BTC-EUR', gdaxCallback); 

*/ 


//nächste Schritte
//1. MFI
//3. Trade Klasse anfangen: Trader(TradeTable, TradeRule){}


//Initialize TradeTable
var tradeTable1 = new TradeTable({name: "My Table", csvFilePath: './data/raw/training_15min_intervall_raw.csv'});
console.log(tradeTable1.name);
//add gdax data
tradeTable1.appendGDAXData(gdaxData3);
//add indicator
tradeTable1.upsert_MACDbasedIndicators("close");
tradeTable1.upsertColumn("datetime", tradeTable1.getColumnValues("time").map(function(e) { return timestamp.toDate(e); }));

//tradeTable1.printTradeTable();



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
    limitLoss : {active: false, acceptableLossInPercent: 0.05}
  }
  
  
}

console.log("Test");