var express = require('express');
var fs = require("fs");
var router = express.Router();
var TradeTable = require("./../src/TradeTable.js");
var Trader = require("./../src/Trader.js");
var jsonQuery = require('json-query');
var dateFormat = require('dateformat');
var timestamp = require('unix-timestamp');
var Downloader = require("./../src/Downloader.js");


var simulationTradeTable = new TradeTable({name: "GDAX Results"});;
var jsonFile = NaN;
var startingBudget = NaN;
var ruleObject = NaN;
var simulationLog = [];

function checkSignIn (req, res, next){
  if(req.session.user){
     next();     //If session exists, proceed to page
  } else {
     res.render('message', { message: 'Not signed in!'});
     next(); 
  }
}

function addLogEntry (entry){
  var logLength = simulationLog.length;
  if (logLength > 100) simulationLog.shift();
  var currentDate = dateFormat(timestamp.toDate(Date.now()/1000), "dd.mm.yyyy HH:MM:ss");
  simulationLog.push(currentDate+": "+entry);
}

router.get('/', checkSignIn, function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.send('Simulation routes...');
});

router.get('/simulatedTrading', checkSignIn, function(req, res, next) {
  res.render('simulation/simulatedTrading', {Status: "", user: req.session.user});
});

router.post('/startSimulatedTrading', function(req, res, next) {
  //simulationTradeTable = new TradeTable({name: "GDAX Results"});

  var downloader = new Downloader({
          intervalLengthSeconds: req.body.intervalLengthSeconds,
          maxIntervals: 350,
          maxHistoryDays: req.body.maxHistoryDays,
  });

  addLogEntry("Initial download started...");

  downloader.startInitalDownload(function(data) {
      data = data.reverse();
      simulationTradeTable.appendGDAXData(data);
      simulationTradeTable.refreshIndicators();  
      //res.render('simulation/simulatedTrading', {Status: "", user: req.session.user});

      //simulationTradeTable.printTradeTable();

      addLogEntry("Incremental download started...");

      downloader.startIncrementalDownload(simulationTradeTable, function(data) {
        console.log('Newly downloaded interval: '+data);
        addLogEntry('Newly downloaded interval: '+data);
        simulationTradeTable.appendGDAXData(data);
        simulationTradeTable.refreshIndicators();  

        //Make Decision
        jsonFile = fs.readFileSync("./data/tradeRules/rule2.json");
        //ruleObject = JSON.parse(jsonFile);
        //startingBudget = 100;
        
        //var trader = new Trader({tradeTable: backtestingTradeTable, tradeRule: ruleObject});
        //backtestingTradeTable = trader.performBacktestTrading(34, startingBudget, 0.0025);
        //Trade Accordingly
      },
      function(data) {
        addLogEntry(data);
      }
      );
  });
  
});

router.get('/getStatusUpdate', checkSignIn, function(req, res, next) {
  res.json(simulationLog);
});

router.get('/getTradeTable', checkSignIn, function(req, res, next) {
  res.json(simulationTradeTable.getAllIntervalls());
});

module.exports = router;
