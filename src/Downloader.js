var dateFormat = require('dateformat');
var date = require('date-and-time');
var request = require('request');
var Gdax = require('gdax');
var publicClient = new Gdax.PublicClient();
var tradeTable = require("./TradeTable.js");

class Downloader{

  constructor(options) {
    this.intervalLengthSeconds = options.intervalLengthSeconds;
    this.maxIntervalls = options.maxIntervallsPerDownload;

    this.startDate = new Date();
    this.startDate.setMinutes(0);
    this.startDate.setSeconds(0);

    this.endDate = new Date(this.startDate.getTime());
    this.startDate.setDate(this.startDate.getDate() - options.historyLengthDays);

    this.window_start = new Date(this.startDate.getTime());
    this.window_end = new Date(this.startDate.getTime());
    this.window_end = date.addSeconds(this.window_end, this.intervalLengthSeconds * this.maxIntervalls);

    //initialize results table
    this.resultsTable = options.results;
  }

  
  processIncrementalResult(error, response, body) {
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
        this.resultsTable.appendGDAXData(array);
        counter++;
      }
    }

    body = body.reverse();
    var counter = 0;
    body.forEach(itemFunction);
    console.log('Incremental finished: ', counter + ' rows added');
  }


  initialDownload() {
    setTimeout(function () {
      publicClient.getProductHistoricRates('BTC-EUR', {
        granularity: this.intervalLengthSeconds,
        start: dateFormat(this.window_start, "yyyy.mm.dd HH:MM:ss"),
        end: dateFormat(this.window_end, "yyyy.mm.dd HH:MM:ss")
      }, processInitialResult);
    }, 1000);
  }

  incrementalDownload() {
    //von endDate zu currentTime
    setInterval(function () {
      publicClient.getProductHistoricRates('BTC-EUR', {
        granularity: this.intervalLengthSeconds
      }, processIncrementalResult);
    }, 5000);
  }

  //initialDownload();
}

//exports the module globally to make it available for other .js files
module.exports = Downloader;

