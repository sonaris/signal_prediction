var jsonQuery = require('json-query');
var stringify = require('json-stringify');
var columnify = require('columnify');
var timestamp = require('unix-timestamp');
var MACD = require('technicalindicators').MACD;
var fs = require('fs');
Number.isNaN = require('is-nan');
var json2csv = require('json2csv');
var moment = require('moment-timezone');
var vectorOperation = require("./utils/vectorOperation.js");
var windowOperation = require("./utils/windowOperation.js");
var statistics = require("./utils/statistics.js");
var indicators = require("./utils/indicators.js");
var helper = require("./utils/helper.js");

class TradeTable{

  //##################################################################
  //Contructor of TradeTable Class
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

  //##################################################################
  //refreshs all available indicators or adds them if not available
  refreshIndicators(){
    //upsert datetime
    this.upsertColumn("datetime", this.getColumnValues("time").map(function(e) { 
      return moment.unix(e).tz("Europe/Berlin").format("YYYY-MM-DD HH:mm");
    
    }));
    
    //upsert indicators
    this.upsert_MACDbasedIndicators("close");
    this.upsertMFI(14);
    this.upsertRSI(14);


    
  }

  //##################################################################
  //Helper function to check availability of element in array
  contains(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] == obj) {
            return true;
        }
    }
    return false;
  }

  //##################################################################
  //Loads a csv file into the intervalls array
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

  //##################################################################
  //saves a csv file inclusing all indicators. Saving is only possible if indicators where created
  saveTableToCSVFile(filepath, seperator){
    var fields = Object.keys(this.data.intervalls[0]);
    
    var exportIntervalls = this.data.intervalls;

    var csv = json2csv({ data: exportIntervalls, fields: fields , del: seperator});
    
    fs.writeFile(filepath, csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });

  }

  //##################################################################
  //Prints the table name to the console
  printTableNameinConsole() {
    console.log(this.name);
  };

  //##################################################################
  //Returns all intervals as array
  getAllIntervalls() {
    return this.data.intervalls;
  };

  //##################################################################
  //Prints a buitified text version of the table to the console
  printTradeTable() {
    
    var columns = columnify(this.data.intervalls);
    
    return console.log(columns)
  }

  //##################################################################
  //Prints a buitified text version of the table to the console
  getTradeTableTXT() {
    
    var columns = columnify(this.data.intervalls);
    
    return columns;
  }

  //##################################################################
  //Prints a json representation of the table
  getTableInteractionsJSONString() {
    var jsonPretty = stringify(this.data.metadata.tableInteractions,null,2);  

    console.log(jsonPretty);
  }

  //##################################################################
  //Appends GDAX data to the end of the intervalls array
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

  //##################################################################
  //Appends an intervall in the object format
  appendSingleIntervall(intervall) {
    
    //insert single row
    var newRow = intervall;
    newRow.index = this.data.intervalls.length;
    this.data.intervalls.push(newRow);

    return this.data.intervalls;
  }

  //##################################################################
  //appends multiple intervalls in the object format
  appendMultipleIntervalls(intervallArray) {
    
    

    this.data.intervalls.push.apply(this.data.intervalls, intervallArray)

    return this.data.intervalls;
  }

  addEmptyColumn(columnName){
    for( var i = 0; i < this.data.intervalls.length; ++i ) {
      this.data.intervalls[i][columnName] = NaN;
    }

    return this.data.intervalls;
  }

  getRowsByColumnCondition(columnName, condition){
    return "TODO";
  }

  getBuyRows(){
    var buyRows = jsonQuery('intervalls[*signal=buy]', {data: this.data});
    return buyRows;
  }

  getSellRows(){
    var sellRows = jsonQuery('intervalls[*signal=sell]', {data: this.data});
    return sellRows;
  }

  //##################################################################
  //Adds a new column. Values must be specified and length of array equal to number of rows
  upsertColumn(columnName, arrayOfValues) {

    if (arrayOfValues.length != this.data.intervalls.length){
      throw new Error("New Column length is not equal to table column length: Length = " + this.data.intervalls.length);
    }

    for( var i = 0; i < this.data.intervalls.length; ++i ) {
      this.data.intervalls[i][columnName] = arrayOfValues[i];
    }

    return this.data.intervalls;
  }

  //##################################################################
  //Resets the index starting with 0
  resetIndex() {
    var n = this.data.intervalls.length; 
    var index = Array.apply(null, {length: n}).map(Number.call, Number)

    this.upsertColumn("index", index);

    return true;
  }


  //##################################################################
  //Returns all values of a given column name
  getColumnValues(columnName) {
      
    var queryResult = jsonQuery('intervalls.'+columnName, {data: this.data}).value;

    if (queryResult.length == 0){
      throw new Error("Column name is not available in Trade Table. Names are case sensitive!");
    }

    return queryResult;
  }

  //##################################################################
  //returns the value at a given index and column name
  getValue(index, column) {

    var availableKeys = Object.keys(this.data.intervalls[0]);

    if (this.contains(availableKeys,column) == true){
      var value = this.data.intervalls[index][column];

      return value;
    }else{
      throw new Error("Column name ["+column+"] is not available. Available columns are: " + availableKeys.toString());
    }

  }

  //##################################################################
  //Sets the value at a given index and column name
  setValue(index, column, value) {

    var availableKeys = Object.keys(this.data.intervalls[0]);

    if (this.contains(availableKeys,column) == true){
      this.data.intervalls[index][column] = value;
      return this.data.intervalls[index][column];
    }else{
      throw new Error("Column name ["+column+"] is not available. Available columns are: " + availableKeys.toString());
    }

  }

  //##################################################################
  //Upserts the MACD historgram
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
      var leadingNANs = Array.apply(null, Array(inputArray.length-histogram_shortened.length)).map(Number.prototype.valueOf,0);
      var macd_histogram_final = leadingNANs.concat(histogram_shortened);
    
      //upsert indicator
      this.upsertColumn("macd_histogram",macd_histogram_final);

      return true;
    }
    
  }

  //##################################################################
  /**
   * @description Upserts the Money-flow Index using period as parameter
   */
  upsertMFI(period){
    var typicalMoney = [];
    var moneyFlow = [];
    for (var i = 0; i < this.data.intervalls.length; i++)
    {
      var tpMoney = (this.data.intervalls[i].high + this.data.intervalls[i].low + this.data.intervalls[i].close) / 3;
      typicalMoney.push(tpMoney);
      moneyFlow.push (tpMoney * this.data.intervalls[i].volume);
    }

    var posMoneyFlow = [];
    var negMoneyFlow = [];
    for (var i = 0; i < typicalMoney.length-1; i++)
    {
      if (typicalMoney[i] <= typicalMoney[i+1])
      {
        posMoneyFlow.push (moneyFlow[i+1]);
        negMoneyFlow.push(0);
      }
      else if (typicalMoney[i] > typicalMoney[i+1])
      {
        posMoneyFlow.push (0);
        negMoneyFlow.push (moneyFlow[i+1]);
      }
      else // typical money unchanged implies day is discharged
      {
        posMoneyFlow.push(0);
        negMoneyFlow.push(0);
      }
    }

    var sumPosFlow = windowOperation.windowOp (posMoneyFlow, period, vectorOperation.sumVector);
    var sumNegFlow = windowOperation.windowOp (negMoneyFlow, period, vectorOperation.sumVector);
    var moneyRatio = vectorOperation.divVector(sumPosFlow, sumNegFlow);

    var mfi = [];
    moneyRatio.forEach (function (value)
    {
      mfi.push (100 - (100/(1+value)));
    });

    var leadingNANs = Array.apply(null, Array(this.data.intervalls.length-mfi.length)).map(Number.prototype.valueOf,0);
    var mfi_final = leadingNANs.concat(mfi);
  
    //upsert indicator
    this.upsertColumn("mfi",mfi_final);

    return true;
  }

  //##################################################################
  /**
   * @description Upserts the RSI using order as parameter
   */
  upsertRSI(order){

    var closePrices = this.getColumnValues("close");
    
    if (closePrices.length < order+1)
    {
      return [-1]; // not enough params
    }
    
    var gains = [];
    var losses = [];

    for (var i = 0; i < this.data.intervalls.length-1; i++)
    {
      var diff = closePrices[i+1] - closePrices[i];
      if (diff > 0) 
      {
        gains.push(diff);
        losses.push(0);
      }
      else if (diff < 0)
      {
        gains.push(0);
        losses.push(Math.abs(diff));
      }
      else
      {
        gains.push(0);
        losses.push(0);
      }
    }
    var result = [];
    var avgGain = vectorOperation.avgVector (gains.slice(0, order));
    var avgLoss = vectorOperation.avgVector (losses.slice (0, order));
    var firstRS = avgGain / avgLoss;
    result.push (100 - (100 / (1 + firstRS)));
    
    for (var i = order; i < closePrices.length-1; i++)
    {
      var partialCurrentGain = ((avgGain * (order-1)) + gains[i]) / order;
      var partialCurrentLoss = ((avgLoss * (order-1)) + losses[i]) / order;
      var smoothedRS = partialCurrentGain / partialCurrentLoss;
      var currentRSI = 100 - (100 / (1 + smoothedRS))
      result.push(currentRSI);
      avgGain = partialCurrentGain;
      avgLoss = partialCurrentLoss;
    }
    //var newValues = closePrices.slice()
    //return reverseAppend(newValues, result, "rsi");

    var leadingNANs = Array.apply(null, Array(closePrices.length-result.length)).map(Number.prototype.valueOf,0);
    var rsi_final = leadingNANs.concat(result);
  
    //upsert indicator
    this.upsertColumn("rsi",rsi_final);

    return true;

  }

  
  //##################################################################
  //Upsert a slopePercentage based on provided column name which will be used as the basis for calculation
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


  //##################################################################
  //Upserts min, max extrems based on provided column name
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

  //##################################################################
  //Upserts all related MACD indicators
  upsert_MACDbasedIndicators(){
    this.upsertMACD_histogram("close");
    this.upsert_slopePercentage("macd_histogram");
    this.upsert_extrems("macd_histogram_slopePercentage", "macd_histogram_extrems");

  }

}

//exports the module globally to make it available for other .js files
module.exports = TradeTable; 
