var Gdax = require('gdax');
var publicClient = new Gdax.PublicClient();
var tradeTable = require("../TradeTable.js");
var downloader = require("./../Downloader.js");

 
publicClient.getProductTicker('BTC-EUR', function(error, response, body) {
    if(error) {
      console.log('error: '+error)
    }
    else {
      //console.log(body);

      //[time, low, high, open, close, volume]
      var currentUnix = Math.floor(Date.now() / 1000);

      var test = [ 
        [currentUnix, 0, 0, 0, body.price, 0]
      ];

      console.log(test);
      
    }
  });

