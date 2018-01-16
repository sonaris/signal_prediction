Number.isNaN = require('is-nan');




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
    this.tradingType = options.tradingType || NaN;

    if (Number.isNaN(this.tradeTable) == true || 
        Number.isNaN(this.tradeRule) == true ||
        Number.isNaN(this.tradingType) == true){
          throw new Error("Please provide all three paramters: tradeTable, tradeRule and tradingType");
    }

    //variables for trade rules
    this.mfi_valueAtLastBuy = NaN;
    this.lastBuyPrice = NaN;
    this.previousSignal = NaN;
  }

  //##########################################################################################
  //TRADING TYPES
  //##########################################################################################

  /**
   * @description: Performs a backtest trading based on provided TradeTable and TradeRule. Adds the columns: Signal, Bitcoins, Budget, Profit
   */
  performBacktestTrading(){
    
    return true;

    
  }

  //##########################################################################################
  //RULE EVALUATION
  //##########################################################################################

  /**
   * @description: Evaluates the buy rule for a given row index and returns "true" or "false"
   */
  evaluateBuyRule(rowIndex){

  }

  /**
   * @description: Evaluates the sell rule for a given row index and returns "true" or "false"
   */
  evaluateSellRule(rowIndex){

  }


  //##########################################################################################
  //COMPARISON TYPES
  //##########################################################################################

  /**
   * @description: Evaluates a comparison rule
   * @param: {"type": "comparisonWithValue", "column": "mfi", "operator": "<", "value": 10}
   */
  evaluateComparisonWithValue(comparisonObject){
    return true;
  }

  /**
   * @description: Evaluates a comparison rule that compares a column with a statistical value like average or median of the same column in a defined period
   * @param: {"type": "ComparisonWithStatistic", "column": "column name", "operator": ">=", "statistic": "average or median", "period": 14}
   */
  evaluateComparisonWithStatistic(comparisonObject){
    return true;
  }

  /**
   * @description: Evaluates a calculationWithVariableAndComparison rule
   * @param: {"type": "calculationWithVariableAndComparisonWithValue", "column": "mfi", "operator1": "-", "variable": "mfi_valueAtLastBuy", "operator2": ">", "value": 43}
   */
  evaluateCalculationWithVariableAndComparisonWithValue(comparisonObject){
    return true;
  }






}