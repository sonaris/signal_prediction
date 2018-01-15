var dateFormat = require('dateformat');
var date = require('date-and-time');
var request = require('request');
var Gdax = require('gdax');
var publicClient = new Gdax.PublicClient();
var tradeTable = require("./utilities/TradeTable.js");

var intervalLengthSeconds = 900;
var maxIntervalls = 350;

var startDate = new Date();
startDate.setHours(00);
startDate.setMinutes(00);
startDate.setSeconds(00);
startDate.setDate(startDate.getDate() - 30);

var endDate = new Date();
endDate.setHours(00);
endDate.setMinutes(00);
endDate.setSeconds(00);

var window_start = new Date(startDate.getTime());
var window_end = new Date(startDate.getTime());

window_end = date.addSeconds(window_end, intervalLengthSeconds*maxIntervalls);

//initialize results table
var resultsTable = new tradeTable({name: "GDAX Results"});


function processInitialResult(error, response, body) {
  console.log('error:', error);
  console.log('statusCode:', response && response.statusCode);

  console.log('Initial download started:----------------------------------------');
  console.log('startDate:', dateFormat(startDate, "yyyy.mm.dd HH:MM:ss"));
  console.log('endDate:', dateFormat(endDate, "yyyy.mm.dd HH:MM:ss"));
  console.log('window_start:', dateFormat(window_start, "yyyy.mm.dd HH:MM:ss"));
  console.log('window_end:', dateFormat(window_end, "yyyy.mm.dd HH:MM:ss"));

  //reverse result to get ascending order
  body.reverse();
  
  //add new datasets 
  resultsTable.appendGDAXData(body);
  console.log('result:', 'Initial download finisched at: ' + dateFormat(Date.now(), "yyyy.mm.dd HH:MM:ss"));
  //resultsTable.printTradeTable();

  if (window_end < endDate) {
    //update dates
    window_start = new Date(window_end.getTime());
    window_start = date.addSeconds(window_start, intervalLengthSeconds);
    window_end = date.addSeconds(window_end, intervalLengthSeconds*maxIntervalls);
    if (window_end > endDate) window_end = new Date(endDate.getTime());

    initialDownload();
  }
  else {
    console.log('Incremental download started:----------------------------------------');
    incrementalDownload();
  }

}

function processIncrementalResult(error, response, body) {
  console.log('error:', error);
  console.log('statusCode:', response && response.statusCode);

  function itemFunction(item) {
    
    var currentTimeValue = item[0];
    //console.log('TimeValue:', currentTimeValue);
    var existentTimeValues = resultsTable.getColumnValues("time");
    //console.log('existentTimeValue:', existentTimeValues);

    //search currentTimeValue in existent values
    var search = existentTimeValues.indexOf(currentTimeValue);
    //console.log('search:', search);

    //insert when not already inserted
    if (search == -1) {
      var array = new Array(1);
      array[0] = item;
      //console.log('currentTimeValue:', array);
      resultsTable.appendGDAXData(array);   
      counter++; 
    }   
  }

  body = body.reverse();
  var counter = 0;
  body.forEach(itemFunction);
  console.log('Incremental finished: ', counter + ' rows added');
}


function initialDownload() {
  setTimeout(function () {
    publicClient.getProductHistoricRates('BTC-EUR', {
      granularity: intervalLengthSeconds,
      start: dateFormat(window_start, "yyyy.mm.dd HH:MM:ss"),
      end: dateFormat(window_end, "yyyy.mm.dd HH:MM:ss")
    }, processInitialResult);
  }, 1000);
}

function incrementalDownload() {
  //von endDate zu currentTime
  setInterval(function () {
    publicClient.getProductHistoricRates('BTC-EUR', {
      granularity: intervalLengthSeconds
    }, processIncrementalResult);
  }, 5000);
}


initialDownload();