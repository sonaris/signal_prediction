var express = require('express');
var fs = require("fs");
var router = express.Router();
var TradeTable = require("./../src/TradeTable.js");
var Trader = require("./../src/Trader.js");
var jsonQuery = require('json-query');



router.get('/activeRule', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  //res.send('TradeRule routes...');

  var tradeRuleMetaData = fs.readFileSync("./data/tradeRules/metadata.json");
  var activeRuleFilename = JSON.parse(tradeRuleMetaData).activeRule;

  var activeRule = fs.readFileSync("./data/tradeRules/"+activeRuleFilename);

  res.render('tradeRules/activeRule', {tradeRuleMetaData: tradeRuleMetaData, activeRule: activeRule});
});


module.exports = router;
