var dateFormat = require('dateformat');
var date = require('date-and-time');
var request = require('request');
var Gdax = require('gdax');
var publicClient = new Gdax.PublicClient();
var tradeTable = require("./TradeTable.js");

  function Downloader(options) {
    this.intervalLengthSeconds = options.intervalLengthSeconds;
    this.maxIntervalls = options.maxIntervallsPerDownload;

    this.startDate = new Date();
    this.startDate.setHours(0);
    this.startDate.setMinutes(0);
    this.startDate.setSeconds(0);

    this.endDate = new Date(this.startDate.getTime());
    this.startDate.setDate(this.startDate.getDate() - options.historyLengthDays);

    this.window_start = new Date(this.startDate.getTime());
    this.window_end = new Date(this.startDate.getTime());
    this.window_end = date.addSeconds(this.window_end, this.intervalLengthSeconds * this.maxIntervalls);

    //initialize results table
    this.resultsTable = options.results;

    var self = this;

    this.processInitialResult = function (error, response, body) {
      console.log('error:', error);
      console.log('statusCode:', response && response.statusCode);
  
      console.log('Initial download started:----------------------------------------');
      console.log('startDate:', dateFormat(self.startDate, "yyyy.mm.dd HH:MM:ss"));
      console.log('endDate:', dateFormat(self.endDate, "yyyy.mm.dd HH:MM:ss"));
      console.log('window_start:', dateFormat(self.window_start, "yyyy.mm.dd HH:MM:ss"));
      console.log('window_end:', dateFormat(self.window_end, "yyyy.mm.dd HH:MM:ss"));
  
      //reverse result to get ascending order
      body.reverse();
  
      //add new datasets 
      self.resultsTable.appendGDAXData(body);
      console.log('result:', 'Initial download finisched at: ' + dateFormat(Date.now(), "yyyy.mm.dd HH:MM:ss"));
      //resultsTable.printTradeTable();
  
      if (self.window_end < self.endDate) {
        //update dates
        self.window_start = new Date(self.window_end.getTime());
        self.window_start = date.addSeconds(self.window_start, self.intervalLengthSeconds);
        self.window_end = date.addSeconds(self.window_end, self.intervalLengthSeconds * self.maxIntervalls);
        if (self.window_end > self.endDate) self.window_end = new Date(self.endDate.getTime());
  
        self.initialDownload();
      }
      else {
        console.log('Incremental download started:----------------------------------------');
        self.incrementalDownload();
      }
  
      return true;
    }
  
    this.processIncrementalResult = function (error, response, body) {
      //console.log('error:', error);
      //console.log('statusCode:', response && response.statusCode);
  
      function itemFunction(item) {
  
        var currentTimeValue = item[0];
        //console.log('TimeValue:', currentTimeValue);
        var existentTimeValues = self.resultsTable.getColumnValues("time");
        //console.log('existentTimeValue:', existentTimeValues);
  
        //search currentTimeValue in existent values
        var search = existentTimeValues.indexOf(currentTimeValue);
        //console.log('search:', search);
  
        //insert when not already inserted
        if (search == -1) {
          var array = new Array(1);
          array[0] = item;
          //console.log('currentTimeValue:', array);
          self.resultsTable.appendGDAXData(array);
          counter++;
        }
      }
  
      body = body.reverse();
      var counter = 0;
      body.forEach(itemFunction);
      
      console.log('Incremental finished: ', counter + ' rows added at '+ dateFormat(Date.now(), "yyyy.mm.dd HH:MM:ss"));
    }
  
  
    this.initialDownload = function() {
      setTimeout(function () {
        publicClient.getProductHistoricRates('BTC-EUR', {
          granularity: self.intervalLengthSeconds,
          start: dateFormat(self.window_start, "yyyy.mm.dd HH:MM:ss"),
          end: dateFormat(self.window_end, "yyyy.mm.dd HH:MM:ss")
        }, self.processInitialResult);
      }, 1000);
    }
  
    this.incrementalDownload = function() {
      //von endDate zu currentTime
      setInterval(function () {
        publicClient.getProductHistoricRates('BTC-EUR', {
          granularity: self.intervalLengthSeconds
        }, self.processIncrementalResult);
      }, 5000);
    }
  }

  

  


//exports the module globally to make it available for other .js files
module.exports = Downloader;

