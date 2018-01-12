var dateFormat = require('dateformat');
var date = require('date-and-time');
var request = require('request');
var Gdax = require('gdax');
var publicClient = new Gdax.PublicClient();


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

window_end = date.addDays(window_end, 3);

var result = ""

function processInitialResult(error, response, body) {
  console.log('error:', error);
  console.log('statusCode:', response && response.statusCode);

  console.log('startDate:', dateFormat(startDate, "yyyy.mm.dd HH:MM:ss"));
  console.log('endDate:', dateFormat(endDate, "yyyy.mm.dd HH:MM:ss"));
  console.log('window_start:', dateFormat(window_start, "yyyy.mm.dd HH:MM:ss"));
  console.log('window_end:', dateFormat(window_end, "yyyy.mm.dd HH:MM:ss"));

  //add new datasets 
  result = body;

  //print current result
  //console.log('result:', result);
  console.log('result:', 'download finisched at: ' + Date.now());

  if (window_end < endDate) {
    //update dates
    window_start = new Date(window_end.getTime());
    window_start = date.addMinutes(window_start, 15);
    window_end = date.addDays(window_end, 3);
    if (window_end > endDate) window_end = new Date(endDate.getTime());

    initialDownload();
  }
  else incrementalDownload();

}

function processIncrementalResult(error, response, body) {
  console.log('error:', error);
  console.log('statusCode:', response && response.statusCode);
}


function initialDownload() {
  setTimeout(function () {
    publicClient.getProductHistoricRates('BTC-EUR', {
      granularity: 900,
      start: dateFormat(window_start, "yyyy.mm.dd HH:MM:ss"),
      end: dateFormat(window_end, "yyyy.mm.dd HH:MM:ss")
    }, processInitialResult);
  }, 1000);
}

function incrementalDownload() {
  //von endDate zu currentTime
  setInterval(function () {
    publicClient.getProductHistoricRates('BTC-EUR', {
      granularity: 900
    }, processIncrementalResult);
  }, 5000);
}


initialDownload();


//Execute every 5 seconds
//setInterval(function (){ request(options, processSingleResult);}, 5000);

