var downloader = require("./../Downloader.js");

options = {
    intervalLengthSeconds: 900,
    maxIntervallsPerDownload: 350,
    historyLengthDays: 30,
}

var downloader = new downloader(options);

downloader.initialDownload();

//Test
setTimeout(function () {
    console.log(downloader.getResultsTable().getAllIntervalls());
  }, 5000);

