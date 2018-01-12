var jsonQuery = require('json-query');
var stringify = require('json-stringify');
var columnify = require('columnify');
var timestamp = require('unix-timestamp');
var MACD = require('technicalindicators').MACD;
var fs = require('fs');
Number.isNaN = require('is-nan');
var json2csv = require('json2csv');
var moment = require('moment-timezone');

class TradeTable{

  constructor(options) {

    this.name = options.name || NaN;
    this.csvFilePath = options.csvFilePath || NaN;
    this.csvSeperator = options.csvSeperator || NaN;

    //this object will contain all intervalls
    this.data = {
      intervalls: [],
      metadata:{
        tableInteractions: []
      }
    }

    if (Number.isNaN(this.csvFilePath) == false){
      this.loadTableFromCSVFile();
    }

  }

  refreshIndicators(){
    //upsert datetime
    this.upsertColumn("datetime", this.getColumnValues("time").map(function(e) { 
      return moment.unix(e).tz("Europe/Berlin").format("YYYY-MM-DD HH:mm");
    
    }));
    
    //upsert indicators indicator
    this.upsert_MACDbasedIndicators("close");
    
  }

  contains(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] == obj) {
            return true;
        }
    }
    return false;
  }

  loadTableFromCSVFile(seperator){
    var seperator = this.csvSeperator;
    var firstLine = [];

    var indexTime = -1;
    var indexLow = -1;
    var indexHigh = -1;
    var indexOpen = -1;
    var indexClose = -1;
    var indexVolume = -1;

    var loadedIntervalls = [];

    fs.readFileSync(this.csvFilePath).toString().split('\n').forEach(function (line) { 
      
      var lineArray = line.split(seperator);

      if (firstLine.length == 0){

        indexTime = lineArray.indexOf("time");
        indexLow = lineArray.indexOf("low");
        indexHigh = lineArray.indexOf("high");
        indexOpen = lineArray.indexOf("open");
        indexClose = lineArray.indexOf("close");
        indexVolume = lineArray.indexOf("volume");

        //check availability needed gdax columns
        if ((indexTime != -1) && (indexLow != -1) && (indexHigh != -1) && (indexOpen != -1) && (indexClose != -1) && (indexVolume != -1) ){
          //continue
          firstLine = lineArray;
        }else{
          throw new Error("First line of csv needs to contain: time, low, high, open, close, volume. Additional columns are possible but will not be loaded!");
        }
        
      }else{
        //add row by row to the TradeTable json object
        if (lineArray.length >=6){
          loadedIntervalls.push({ index: loadedIntervalls.length ,
                                  time: Number(lineArray[indexTime]), 
                                  low: Number(lineArray[indexLow]), 
                                  high: Number(lineArray[indexHigh]), 
                                  open: Number(lineArray[indexOpen]), 
                                  close: Number(lineArray[indexClose]), 
                                  volume: Number(lineArray[indexVolume])});
        }

        
      }

    })

    this.data.intervalls = loadedIntervalls;
  }

  saveTableToCSVFile(filepath, seperator){
    var fields = ['time', 'low', 'high','open','close','volume','datetime', 'MACD_histogram','MACD_histogram_slopePercentage','MACD_histogram_extrems'];
    
    var exportIntervalls = this.data.intervalls;

    var csv = json2csv({ data: exportIntervalls, fields: fields , del: seperator});
    
    fs.writeFile(filepath, csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });

  }

  printTableNameinConsole() {
    console.log(this.name);
  };

  getAllIntervalls() {
    return this.data.intervalls;
  };

  printTradeTable() {
    
    var columns = columnify(this.data.intervalls);
    
    return console.log(columns)
  }

  getTableInteractionsJSONString() {
    var jsonPretty = stringify(this.data.metadata.tableInteractions,null,2);  

    console.log(jsonPretty);
  }

  appendGDAXData(gdaxArray) {

    if ( gdaxArray[0].length == undefined || gdaxArray[0].length != 6){
      throw new Error("Input needs to be a 2d Array like [[1,2,3,4,5,6], [7,8,9,10,11,12]] or [[1,2,3,4,5,6]]");
    }

    function contains(array, obj) {
        var i = array.length;
        while (i--) {
            if (array[i] == obj) {
                return true;
            }
        }
        return false;
    }
    
    var times = jsonQuery('intervalls.time', {data: this.data}).value;

    for( var i = 0; i < gdaxArray.length; ++i ) {
      if (times.length == 0 || contains(times, gdaxArray[i][0]) == false){
        this.data.intervalls.push({index: this.data.intervalls.length ,time: gdaxArray[i][0], low: gdaxArray[i][1], high: gdaxArray[i][2], open: gdaxArray[i][3], close: gdaxArray[i][4], volume: gdaxArray[i][5]});
      }else{
        throw new Error("You were trying to add a time value that already exists: time = " + gdaxArray[i][0]);
      }
      
      
    }

    return this.data.intervalls;
  }

  appendSingleIntervall(intervall) {
    
    //insert single row
    var newRow = intervall;
    newRow.index = this.data.intervalls.length;
    this.data.intervalls.push(newRow);

    return this.data.intervalls;
  }

  appendMultipleIntervalls(intervallArray) {
    
    

    this.data.intervalls.push.apply(this.data.intervalls, intervallArray)

    return this.data.intervalls;
  }

  upsertColumn(columnName, arrayOfValues) {

    if (arrayOfValues.length != this.data.intervalls.length){
      throw new Error("New Column length is not equal to table column length: Length = " + this.data.intervalls.length);
    }

    for( var i = 0; i < this.data.intervalls.length; ++i ) {
      this.data.intervalls[i][columnName] = arrayOfValues[i];
    }

    return this.data.intervalls;
  }

  resetIndex() {
    var n = this.data.intervalls.length; 
    var index = Array.apply(null, {length: n}).map(Number.call, Number)

    this.upsertColumn("index", index);

    return true;
  }


  getColumnValues(columnName) {
      
    var queryResult = jsonQuery('intervalls.'+columnName, {data: this.data}).value;

    if (queryResult.length == 0){
      throw new Error("Column name is not available in Trade Table. Names are case sensitive!");
    }

    return queryResult;
  }

  getValue(index, column) {

    var availableKeys = Object.keys(this.data.intervalls[0]);

    if (this.contains(availableKeys,column) == true){
      var value = this.data.intervalls[index][column];

      return value;
    }else{
      throw new Error("Column name is not available. Available columns are: " + availableKeys.toString());
    }

  }

  setValue(index, column, value) {

    var availableKeys = Object.keys(this.data.intervalls[0]);

    if (this.contains(availableKeys,column) == true){
      this.data.intervalls[index][column] = value;
      return this.data.intervalls[index][column];
    }else{
      throw new Error("Column name is not available. Available columns are: " + availableKeys.toString());
    }

  }

  upsertMACD_histogram(baseColumn){
  
    var availableKeys = Object.keys(this.data.intervalls[0]);

    if (this.contains(availableKeys,baseColumn) != true){
      throw new Error("Column name is not available. Available columns are: " + availableKeys.toString());
    }else{
      

      var inputArray = this.getColumnValues(baseColumn);

      var macdInput = {
        values            : inputArray,
        fastPeriod        : 12,
        slowPeriod        : 26,
        signalPeriod      : 9 ,
        SimpleMAOscillator: false,
        SimpleMASignal    : false
      }
      
      var macd_table = MACD.calculate(macdInput);
      var histogram_shortened = jsonQuery('histogram', {data: macd_table}).value;
      var zeros = Array.apply(null, Array(inputArray.length-histogram_shortened.length)).map(Number.prototype.valueOf,0);
      var macd_histogram_final = zeros.concat(histogram_shortened);
    
      //upsert indicator
      this.upsertColumn("MACD_histogram",macd_histogram_final);

      return true;
    }
    
  }

  upsert_slopePercentage(baseColumn){
    var availableKeys = Object.keys(this.data.intervalls[0]);

    if (this.contains(availableKeys,baseColumn) != true){
      throw new Error("Column name is not available. Available columns are: " + availableKeys.toString());
    }else{
      var baseColumn_slopePercentage = baseColumn + "_slopePercentage";

      this.data.intervalls[0][baseColumn_slopePercentage] = 0;

      for( var i = 1; i < this.data.intervalls.length; ++i ) {
        
        // slope = ([i])-([i-1])/abs([i-1])

        var currentSlope = (this.getValue(i,baseColumn) - this.getValue(i-1,baseColumn))/Math.abs(this.getValue(i-1,baseColumn))
        
        this.setValue(i,baseColumn_slopePercentage,currentSlope);
      }

    }

    return true;

  }


  upsert_extrems(baseColumn, newColumnName){
    var availableKeys = Object.keys(this.data.intervalls[0]);

    if (this.contains(availableKeys,baseColumn) != true){
      throw new Error("Column name is not available. Available columns are: " + availableKeys.toString());
    }else{
      var baseColumn_extrems = newColumnName;

      this.data.intervalls[0][baseColumn_extrems] = "";

      for( var i = 1; i < this.data.intervalls.length; ++i ) {
        
        if (this.getValue(i-1,baseColumn) < 0 && this.getValue(i,baseColumn) > 0){
          this.setValue(i,baseColumn_extrems,"min");
        }else if (this.getValue(i-1,baseColumn) > 0 && this.getValue(i,baseColumn) < 0){
          this.setValue(i,baseColumn_extrems,"max");
        }
        
      }

    }

    return true;

  }

  upsert_MACDbasedIndicators(){
    this.upsertMACD_histogram("close");
    this.upsert_slopePercentage("MACD_histogram");
    this.upsert_extrems("MACD_histogram_slopePercentage", "MACD_histogram_extrems");

  }

}

module.exports = TradeTable; 

/** Exemplary jsonQuery queries and tests
//Select specific value by condition
var query1 = jsonQuery('intervalls[time=1577869].high', {data: data}).value;
//Select specific row and value by index
var query2 = jsonQuery('intervalls[1].time', {data: data}).value;
//Select complete column
var query3 = jsonQuery('intervalls.time', {data: data}).value;
//Select rows 1 & 2
var query4 = data.intervalls.slice(1,3);

 //Initialize TradeTable
var tradeTable1 = new TradeTable("My Table");
tradeTable1.printTableNameinConsole();
//add gdax data
tradeTable1.insertGDAXData([
[1512752400,13150.0,13478.99,13478.99,13285.0,23.766734420000112],
[1512753300,13250.0,13369.13,13285.0,13337.99,21.92582883000003],
[1512754200,13250.0,13369.12,13337.99,13295.7,19.859693460000006],
[1512755100,13197.23,13300.0,13295.69,13198.85,21.013139410000022],
[1512756000,13167.7,13299.99,13198.85,13169.53,21.153042180000035]
]);
//add indicator
tradeTable1.upsertColumn("MACD",[12,14,16,17,19]);
tradeTable1.upsertColumn("datetime", tradeTable1.getColumnValues("time").map(function(e) { return timestamp.toDate(e); }));
//access and change values
console.log(tradeTable1.getValue(0,"time"));
console.log(tradeTable1.setValue(0,"time",100));
console.log(tradeTable1.getValue(0,"time"));

console.log(tradeTable1.getColumnValues("MACD"));

tradeTable1.resetIndex();
//print tabular representation of table
tradeTable1.printTradeTable();

**/
