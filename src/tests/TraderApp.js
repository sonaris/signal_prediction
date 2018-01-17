var downloader = require("./../Downloader.js");
//var Gdax = require('gdax');
//var publicClient = new Gdax.PublicClient();

options = {
    intervalLengthSeconds: 900,
    maxIntervallsPerDownload: 350,
    historyLengthDays: 30,
}

var downloader = new downloader(options);

downloader.initialDownload();

//Test
setTimeout(function () {
    //console.log(downloader.getResultsTable().getAllIntervalls());
  }, 5000);

/*publicClient.getProductHistoricRates('BTC-EUR', {
    granularity: 900,
    start: '2018.01.17 20:00:00',
    end: '2018.01.17 22:00:00'
  }, 
  function (error, response, body) {
      var test = body.reverse();
    console.log(test);
  }
);*/


  

