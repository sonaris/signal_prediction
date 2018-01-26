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



module.exports = router;
