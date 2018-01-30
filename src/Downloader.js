var dateFormat = require('dateformat');
var date = require('date-and-time');
var request = require('request');
var Gdax = require('gdax');
var publicClient = new Gdax.PublicClient();
var tradeTable = require("./TradeTable.js");
var concat = require('array-concat');
var timestamp = require('unix-timestamp');
var Repeat = require('repeat');

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
    var lastValidUnix = (Math.floor(currentUnix/this.intervalLengthSeconds)*this.intervalLengthSeconds);
    lastValidUnix = lastValidUnix + this.intervalLengthSeconds*1;

    var dataArray = [];

    console.log('Max Intervals:' ,this.maxIntervals);
    console.log('lastValidUnix:' ,lastValidUnix);
    
    this.initialDownload(currentUnix, lastValidUnix-(this.maxIntervals*this.intervalLengthSeconds), lastValidUnix, dataArray, callback);
  }

  this.startIncrementalDownload = function(tradeTable, callbackInsert, callbackWait){
    
    var dataArray = [];

    var dataArray = tradeTable.getAllIntervalls();

    function tryDownload() {
      var currentUnix = Math.floor(Date.now() / 1000);
      //var lastValidUnix = Math.floor(currentUnix/this.intervalLengthSeconds)*this.intervalLengthSeconds;

      var dataArray = tradeTable.getAllIntervalls();
      var latestInterval = dataArray[dataArray.length-1].time;

      if (currentUnix-latestInterval > self.intervalLengthSeconds){
        
        console.log('Next Interval Download Possible');
        console.log('Current Time: ', currentUnix);
        console.log('Latest Interval: ', latestInterval);
        console.log('Current Time Dif in Seconds: ', currentUnix-latestInterval);

        //download current window
        publicClient.getProductHistoricRates('BTC-EUR', {
          granularity: self.intervalLengthSeconds,
          start: dateFormat(timestamp.toDate(latestInterval), "yyyy.mm.dd HH:MM:ss", true),
          end: dateFormat(timestamp.toDate(latestInterval+self.intervalLengthSeconds*1), "yyyy.mm.dd HH:MM:ss", true)
        }, function(error, response, body) {
          if(error) {
            console.log('error: '+error)
          }
          else {
            callbackInsert(body);
            
          }
        });

      }
      else {
        var part1 = self.intervalLengthSeconds*1;
        var part2 = currentUnix-latestInterval;
        console.log("Next download in "+(part1-part2)+" seconds");
        callbackWait("Next download in "+(part1-part2)+" seconds");
      } 
    }
     
    Repeat(tryDownload).every(1000, 'ms').start.in(0, 'sec');
 
  }

    
  }

//exports the module globally to make it available for other .js files
module.exports = Downloader;

