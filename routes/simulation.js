var express = require('express');
var fs = require("fs");
var router = express.Router();
var TradeTable = require("./../src/TradeTable.js");
var Trader = require("./../src/Trader.js");
var jsonQuery = require('json-query');
var Downloader = require("./../src/Downloader.js");


var simulationTradeTable = NaN;
var jsonFile = NaN;
var startingBudget = NaN;
var ruleObject = NaN;

function checkSignIn (req, res, next){
  if(req.session.user){
     next();     //If session exists, proceed to page
  } else {
     res.render('message', { message: 'Not signed in!'});
     next(); 
  }
}

router.get('/', checkSignIn, function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.send('Simulation routes...');
});

router.get('/simulatedTrading', checkSignIn, function(req, res, next) {
  res.render('simulation/simulatedTrading', {Status: "", user: req.session.user});
});

router.post('/startSimulatedTrading', function(req, res, next) {
  simulationTradeTable = new TradeTable({name: "GDAX Results"});

  var downloader = new Downloader({
          intervalLengthSeconds: req.body.intervalLengthSeconds,
          maxIntervals: 350,
          maxHistoryDays: req.body.maxHistoryDays,
  });

  downloader.startInitalDownload(function(data) {
      data = data.reverse();
      simulationTradeTable.appendGDAXData(data);
      simulationTradeTable.refreshIndicators();  
      res.render('simulation/simulatedTrading', {Status: "Initial download finished. Incremental download startet...", user: req.session.user});

      //simulationTradeTable.printTradeTable();

      downloader.startIncrementalDownload(simulationTradeTable, function(data) {
        console.log('Newly downloaded interval: '+data)
        simulationTradeTable.appendGDAXData(data);
        simulationTradeTable.refreshIndicators();  

        res.render('simulation/simulatedTrading', {Status: "New interval added", Progress: data,  user: req.session.user});

        //Make Decision
        
    }
      );
  });
  //res.render('backtesting/loadTradeTableFromGDAX', {Status: "Download started", user: req.session.user});

});

router.get('/getUpdate', checkSignIn, function(req, res, next) {
  var currentUnix = Math.floor(Date.now() / 1000);
  //res.send('Current Unix: ', currentUnix);
  res.json({Test: currentUnix});
});

module.exports = router;
