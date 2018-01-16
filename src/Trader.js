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
  }

  /**
   * @description: Performs a backtest trading based on provided TradeTable and TradeRule
   */
  performBacktestTrading(){
    
    return true;

    
  }

  /**
   * @description: Evaluates TradeRule based on provided rowIndex and returns "buy", "sell" or "wait"
   */
  getSignal(rowIndex){

  }

}