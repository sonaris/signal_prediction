isNaN = require('is-nan');




class Trader{

  /**
   * @description: Contructor of Trader Class. Provide an object that include all parameters
   * @param {object} tradeTable to be traded on
   * @param {object} TradeRule which defines trading strategy
   * @param String trading type to inform trader whether "backtesting","simulatedTrading" or "realTrading should be performed"
   */
  constructor(options) {

    this.tradeTable = options.tradeTable || NaN;
    this.tradeRule = options.tradeRule || NaN;

    if (isNaN(this.tradeTable) == true || 
        isNaN(this.tradeRule) == true ){
          throw new Error("Please provide all three paramters: tradeTable, tradeRule and tradingType");
    }

    //variables for trade rules
    this.mfi_valueAtLastBuy = NaN;
    this.macd_histogram_valueAtLastBuy = NaN;
    this.close_valueAtLastBuy = NaN;

    //extract buy and sell rule from TradeRule Object
    this.buyRule = this.tradeRule.buyRule;
    this.sellRule = this.tradeRule.sellRule;

  }

  //##########################################################################################
  //TRADING TYPES
  //##########################################################################################

  /**
   * @description: Performs a backtest trading based on provided TradeTable and TradeRule. Adds the columns: Signal, Bitcoins, Budget, Profit
   */
  performBacktestTrading(startIndex){
    
    var previousSignal = NaN;

    for( var i = startIndex; i < this.tradeTable.data.intervalls.length; ++i ) {
      
      var currentClosingPrice = this.tradeTable.getValue(i,"close");

      //BUY
      if ((isNaN(previousSignal) || previousSignal == "sell") && this.evaluateBuyOrSellRule(i, this.buyRule)){
        console.log("Buy Signal");

        //set historic buy values
        this.mfi_valueAtLastBuy = this.tradeTable.getValue(i,"mfi");
        this.macd_histogram_valueAtLastBuy = this.tradeTable.getValue(i,"macd_histogram");
        this.close_valueAtLastBuy = this.tradeTable.getValue(i,"close");
        previousSignal = "buy";
      }
      //SELL
      else if (previousSignal == "buy" && this.evaluateBuyOrSellRule(i, this.sellRule)){
        console.log("Sell Signal");

        //set historic sell values
        previousSignal = "sell";
      }
      //WAIT
      else{
        console.log("Waiting for buy or sell signal.")
      }

    }

    return this.tradeTable;

    
  }

  //##########################################################################################
  //RULE EVALUATION
  //##########################################################################################

  /**
   * @description: Evaluates the buy rule for a given row index and returns "true" or "false"
   */
  evaluateBuyOrSellRule(rowIndex, rule){
    
    var orRules = rule.or;
    var overallEvaluation = false;

    //interate through all OR rule sets. A single valid Or rule set is sufficient
    for( var i = 0; i < orRules.length; ++i ) {

      var currentAndRules = orRules[i].and;
      var andRuleEvaluationResult = true;

      //iterate through an And rule set. All conditions need to be met
      for( var j = 0; j < currentAndRules.length; ++j ) {

        var currentlSingleRuleObject = currentAndRules[j];
        var currentRuleType = currentlSingleRuleObject.type;

        switch(currentRuleType){
          case "comparisonWithValue":
            andRuleEvaluationResult = this.evaluateComparisonWithValue(currentlSingleRuleObject);
            break;
          case "comparisonWithStatistic":
            andRuleEvaluationResult = this.evaluateComparisonWithStatistic(currentlSingleRuleObject);
            break;
          case "calculationWithVariableAndComparisonWithValue":
            andRuleEvaluationResult = this.evaluateCalculationWithVariableAndComparisonWithValue(currentlSingleRuleObject);
            break;
          default:
            throw new Error("Rule type not known! available are: ComparisonWithValue, ComparisonWithStatistic, CalculationWithVariableAndComparisonWithValue");
        }

      }

      //break outer for-loop if a valid and ruleset was found
      if (andRuleEvaluationResult == true){
        overallEvaluation = true;
        break;
      }
    }
    
    
    return overallEvaluation;
  }

  //##########################################################################################
  //COMPARISON TYPES
  //##########################################################################################

  /**
   * @description: Evaluates a comparison rule
   * @param: {"type": "comparisonWithValue", "column": "mfi", "operator": "<", "value": 10}
   */
  evaluateComparisonWithValue(singleRuleObject, rowIndex){
    var type = singleRuleObject.type;
    var column = singleRuleObject.column;
    var operator = singleRuleObject.operator;
    var value = singleRuleObject.value;


    return true;
  }

  /**
   * @description: Evaluates a comparison rule that compares a column with a statistical value like average or median of the same column in a defined period
   * @param: {"type": "ComparisonWithStatistic", "column": "column name", "operator": ">=", "statistic": "average or median", "period": 14}
   */
  evaluateComparisonWithStatistic(singleRuleObject, rowIndex){
    var type = singleRuleObject.type;
    var column = singleRuleObject.column;
    var operator = singleRuleObject.operator;
    var statistic = singleRuleObject.statistic;
    var period = singleRuleObject.period;
    
    
    return true;
  }

  /**
   * @description: Evaluates a calculationWithVariableAndComparison rule
   * @param: {"type": "calculationWithVariableAndComparisonWithValue", "column": "mfi", "operator1": "-", "variable": "mfi_valueAtLastBuy", "operator2": ">", "value": 43}
   */
  evaluateCalculationWithVariableAndComparisonWithValue(singleRuleObject, rowIndex){
    var type = singleRuleObject.type;
    var column = singleRuleObject.column;
    var operator1 = singleRuleObject.operator1;
    var variable = singleRuleObject.variable;
    var operator2 = singleRuleObject.operator2;
    var value = singleRuleObject.value;
    
    
    
    return true;
  }



}

//exports the module globally to make it available for other .js files
module.exports = Trader; 