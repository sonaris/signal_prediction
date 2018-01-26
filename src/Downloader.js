var dateFormat = require('dateformat');
var date = require('date-and-time');
var request = require('request');
var Gdax = require('gdax');
var publicClient = new Gdax.PublicClient();
var tradeTable = require("./TradeTable.js");
var concat = require('array-concat');
var timestamp = require('unix-timestamp');

  function Downloader(options) {
    this.intervalLengthSeconds = options.intervalLengthSeconds;
    this.maxIntervals = options.maxIntervals;
    this.maxHistoryDays = options.maxHistoryDays;

    var self = this;

    this.initialDownload = function (currentUnix, startUnix, endUnix, array, callback) {
      console.log('startUnix: '+startUnix);
      console.log('endUnix: '+endUnix);
      console.log('startTime', dateFormat(timestamp.toDate(startUnix), "yyyy.mm.dd HH:MM:ss", true));
      console.log('endTime', dateFormat(timestamp.toDate(endUnix), "yyyy.mm.dd HH:MM:ss", true));
    
      if( currentUnix-startUnix < 86400*self.maxHistoryDays) {
      var startDate = Date(startUnix);
      var endDate = Date(endUnix);
      
      //download current window
      publicClient.getProductHistoricRates('BTC-EUR', {
          granularity: self.intervalLengthSeconds,
          start: dateFormat(timestamp.toDate(startUnix), "yyyy.mm.dd HH:MM:ss", true),
          end: dateFormat(timestamp.toDate(endUnix), "yyyy.mm.dd HH:MM:ss", true)
        }, function(error, response, body) {
          if(error) {
            console.log('error: '+error)
          }
          else {
            array = concat(array, body);
            self.initialDownload(currentUnix, startUnix-(self.maxIntervals*self.intervalLengthSeconds), startUnix, array, callback)
          }
        });
      
    }
    else {
      callback(array);
    }
  }

  this.startInitalDownload = function(callback){
    var currentUnix = Math.floor(Date.now() / 1000);
    var lastValidUnix = Math.floor(currentUnix/this.intervalLengthSeconds)*this.intervalLengthSeconds;
    var dataArray = [];

    console.log(this.maxIntervals);
    
    this.initialDownload(currentUnix, lastValidUnix-(this.maxIntervals*this.intervalLengthSeconds), lastValidUnix, dataArray, callback);
  }

  this.startIncrementalDownload = function(callback){
    var currentUnix = Math.floor(Date.now() / 1000);
    var lastValidUnix = Math.floor(currentUnix/this.intervalLengthSeconds)*this.intervalLengthSeconds;
    var dataArray = [];

    console.log(this.maxIntervals);
    
    this.initialDownload(currentUnix, lastValidUnix-(this.maxIntervals*this.intervalLengthSeconds), lastValidUnix, dataArray, callback);
  }

    
  }

//exports the module globally to make it available for other .js files
module.exports = Downloader;

