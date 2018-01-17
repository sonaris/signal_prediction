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
  performBacktestTrading(startIndex, startBudget, takerFee){
    
    var previousSignal = NaN;
    var currentBudget = startBudget;
    var currentBitcoins = 0;
    var currentProfit = NaN;
    var previousSignal = NaN;
    var lastBudgetAtBuy =  NaN;

    //add new columns
    this.tradeTable.addEmptyColumn("signal");
    this.tradeTable.addEmptyColumn("bitcoins");
    this.tradeTable.addEmptyColumn("budget");
    this.tradeTable.addEmptyColumn("profit");


    for( var i = startIndex; i < this.tradeTable.data.intervalls.length; ++i ) {
      
      var currentClosingPrice = this.tradeTable.getValue(i,"close");

      //BUY
      if ((isNaN(previousSignal) || previousSignal == "sell") && this.evaluateBuyOrSellRule(i, this.buyRule)){

        currentBudget = currentBudget * (1-takerFee);
        lastBudgetAtBuy = currentBudget;
        currentBitcoins = currentBudget/currentClosingPrice;
        currentBudget = 0;

        //add data to tradeTable
        this.tradeTable.setValue(i, "signal", "buy");
        this.tradeTable.setValue(i, "bitcoins", currentBitcoins);
        this.tradeTable.setValue(i, "budget", currentBudget);

        //set historic buy values
        this.mfi_valueAtLastBuy = this.tradeTable.getValue(i,"mfi");
        this.macd_histogram_valueAtLastBuy = this.tradeTable.getValue(i,"macd_histogram");
        this.close_valueAtLastBuy = this.tradeTable.getValue(i,"close");
        previousSignal = "buy";
      }
      //SELL
      else if (previousSignal == "buy" && this.evaluateBuyOrSellRule(i, this.sellRule)){
        
        currentBudget = (currentBitcoins * currentClosingPrice) * (1-takerFee);
        currentBitcoins = 0;
        currentProfit = (currentBudget - lastBudgetAtBuy)/lastBudgetAtBuy;

        //add data to tradeTable
        this.tradeTable.setValue(i, "signal", "sell");
        this.tradeTable.setValue(i, "bitcoins", currentBitcoins);
        this.tradeTable.setValue(i, "budget", currentBudget);
        this.tradeTable.setValue(i, "profit", currentProfit);


        //set historic sell values
        previousSignal = "sell";
      }
      //WAIT
      else{
        
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
          case "javascript":
            andRuleEvaluationResult = eval(currentlSingleRuleObject.code);  

            break;
          default:
            throw new Error("Rule type not known! available are: {'type': 'javascript', 'code': 'Put your code here...'} ");
        }

        //if a single and rule is not satisfied, break the for-loop
        if (andRuleEvaluationResult == false){
          break;
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

}

//exports the module globally to make it available for other .js files
module.exports = Trader; 