var dateFormat = require('dateformat');
var date = require('date-and-time');
var request = require('request');
var Gdax = require('gdax');
var publicClient = new Gdax.PublicClient();
var tradeTable = require("./TradeTable.js");
Number.isNaN = require('is-nan');

class Downloader{

  constructor(options) {
    this.intervalLengthSeconds = options.intervalLengthSeconds;
    this.maxIntervalls = options.maxIntervallsPerDownload;

    this.startDate = new Date();
    this.startDate.setMinutes(00);
    this.startDate.setSeconds(00);

    this.endDate = new Date(this.startDate.getTime());
    this.startDate.setDate(this.startDate.getDate() - options.historyLengthDays);

    this.window_start = new Date(startDate.getTime());
    this.window_end = new Date(startDate.getTime());
    this.window_end = date.addSeconds(window_end, intervalLengthSeconds * maxIntervalls);

    //initialize results table
    this.resultsTable = options.results;
  }



  processInitialResult(error, response, body) {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);

    console.log('Initial download started:----------------------------------------');
    console.log('startDate:', dateFormat(this.startDate, "yyyy.mm.dd HH:MM:ss"));
    console.log('endDate:', dateFormat(this.endDate, "yyyy.mm.dd HH:MM:ss"));
    console.log('window_start:', dateFormat(this.window_start, "yyyy.mm.dd HH:MM:ss"));
    console.log('window_end:', dateFormat(this.window_end, "yyyy.mm.dd HH:MM:ss"));

    //reverse result to get ascending order
    body.reverse();

    //add new datasets 
    this.resultsTable.appendGDAXData(body);
    console.log('result:', 'Initial download finisched at: ' + dateFormat(Date.now(), "yyyy.mm.dd HH:MM:ss"));
    //resultsTable.printTradeTable();

    if (this.window_end < this.endDate) {
      //update dates
      this.window_start = new Date(this.window_end.getTime());
      this.window_start = date.addSeconds(this.window_start, this.intervalLengthSeconds);
      this.window_end = date.addSeconds(this.window_end, this.intervalLengthSeconds * this.maxIntervalls);
      if (this.window_end > this.endDate) this.window_end = new Date(this.endDate.getTime());

      initialDownload();
    }
    else {
      console.log('Incremental download started:----------------------------------------');
      incrementalDownload();
    }

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

