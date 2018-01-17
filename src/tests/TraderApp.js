var downloader = require("./../Downloader.js");

options = {
    intervalLengthSeconds: 900,
    maxIntervallsPerDownload: 350,
    historyLengthDays: 30,
}

var callback = function (){
    console.log('Callback after Download');
}

//Pass trader to downloader 

var downloader = new downloader(options);

downloader.startDownload();


  

