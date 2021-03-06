var express = require('express');
var fs = require("fs");
var router = express.Router();
var TradeTable = require("./../src/TradeTable.js");
var Trader = require("./../src/Trader.js");
var jsonQuery = require('json-query');

function checkSignIn (req, res, next){
  if(req.session.user){
     next();     //If session exists, proceed to page
  } else {
     res.render('message', { message: 'Not signed in!'});
     next(); 
  }
}

router.get('/activeRule', checkSignIn, function(req, res, next) {
  //res.render('index', { title: 'Express' });
  //res.send('TradeRule routes...');

  var tradeRuleMetaData = fs.readFileSync("./data/tradeRules/metadata.json");
  var activeRuleFilename = JSON.parse(tradeRuleMetaData).activeRule;

  var activeRule = fs.readFileSync("./data/tradeRules/"+activeRuleFilename);

  res.render('tradeRules/activeRule', {tradeRuleMetaData: tradeRuleMetaData, activeRule: activeRule, user: req.session.user});
});


module.exports = router;
