# -*- coding: utf-8 -*-
"""
Created on Thu Dec 28 14:27:10 2017

@author: POverfeld
"""

import pandas as pd
import numpy as np
import utilities as utilities
import charting as charting
from sklearn import linear_model
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
import matplotlib.pyplot as plt
from sklearn import tree
import graphviz 
import modeltraining as modeltraining
import math
from sklearn import linear_model
from sklearn.ensemble import RandomForestClassifier
import graphviz 

'''
Description:

'''
def validateTradingProfitWithFullIn_MLBased(classifier, testDataframe, startingBudget):
    currentBitcoins = None
    currentBudget = startingBudget
    currentProfit = None
    lastTransactionType = None
    sellProfits = []
    sellTimestamps = []
    budgetOverTime = []
    currentBudgetBeforeTrade = None
    
    overallAbsoluteProfit = None
    overallRelativeProfit = None
    
    testset = testDataframe.values[:,10:12]

    lastBuyPrice =  None
        
    for rowIndex in range(0, len(testset)):
        currentRow = testset[rowIndex]
        
        #predict Signal
        currentSignal = classifier.predict(currentRow.reshape(1,-1))
        print("CurrentSignal: ", currentSignal)
        
        
        #BUY
        if (currentSignal == 1) and (lastTransactionType is None or lastTransactionType == 2):
            
            print("Perform Buy")
            
            currentBudgetBeforeTrade = currentBudget
            currentClosingPrice = testDataframe.values[rowIndex,4]
            lastBuyPrice = currentClosingPrice
            currentBitcoins = currentBudgetBeforeTrade/currentClosingPrice
            currentBudget = 0
            
            lastTransactionType = 1
        
        #SELL
        elif (currentSignal == 2) and (lastTransactionType == 1):
            
            print("Perform Sell")
            
            #preventing too much loss
            currentClosingPrice = testDataframe.values[rowIndex,4]
            
            if (currentClosingPrice/lastBuyPrice >= 0.95):
                
                currentTimestamp = testDataframe.values[rowIndex,0]
                currentBudget = currentBitcoins * currentClosingPrice
                currentProfit = currentBudget - currentBudgetBeforeTrade
                sellProfits.append(currentProfit)
                sellTimestamps.append(currentTimestamp)
                budgetOverTime.append(currentBudget)
                currentBitcoins = 0
                
                lastTransactionType = 2
        #WAIT
        else:
            
            print("Wait")
    

    overallAbsoluteProfit = budgetOverTime[len(budgetOverTime)-1] - startingBudget
    overallRelativeProfit = (budgetOverTime[len(budgetOverTime)-1] - startingBudget)/startingBudget
    
    print("Your absolute profit is: ",overallAbsoluteProfit, " | Your relative profit is: ",overallRelativeProfit)
    
    return [sellTimestamps, sellProfits, budgetOverTime]  



def validateTradingProfitWithFullIn_RuleBased(testDataframe, startingBudget):
    currentBitcoins = None
    currentBudget = startingBudget
    currentProfit = None
    lastTransactionType = None
    sellProfits = []
    sellTimestamps = []
    budgetOverTime = []
    currentBudgetBeforeTrade = None
    
    overallAbsoluteProfit = None
    overallRelativeProfit = None
    
    testset = testDataframe

    lastBuyPrice =  None
        
    for rowIndex in range(1, len(testset)):
        
        currentSignal = None
        
        #predict Signal
        previousMFI = testset['mfi'][rowIndex-1]
        previousMACD = testset['macd'][rowIndex-1]
        previousMACDDeltaPercentage = testset['macd_delta_percentage'][rowIndex-1]
        
        currentMFI = testset['mfi'][rowIndex]
        currentMACD = testset['macd'][rowIndex]
        currentMACDDeltaPercentage = testset['macd_delta_percentage'][rowIndex]
        
        MACD_localMinimum = False
        MACD_localMaximum = False
        
        if (previousMACDDeltaPercentage <= 0 and currentMACDDeltaPercentage > 0):
            MACD_localMinimum = True
        elif (previousMACDDeltaPercentage > 0 and currentMACDDeltaPercentage < 0):
            MACD_localMaximum = True
        
        if (MACD_localMinimum is True):
            currentSignal = 1
        elif (MACD_localMaximum is True):
            currentSignal = 2
        else:
            currentSignal = 3
        
        
        print("row: ", rowIndex, "| CurrentSignal: ", currentSignal)
        
        
        #BUY
        if (currentSignal == 1) and (lastTransactionType is None or lastTransactionType == 2):
            
            print("Perform Buy")
            
            currentBudgetBeforeTrade = currentBudget
            currentClosingPrice = testset['close'][rowIndex]
            lastBuyPrice = currentClosingPrice
            currentBitcoins = currentBudgetBeforeTrade/currentClosingPrice
            currentBudget = 0
            
            lastTransactionType = 1
        
        #SELL
        elif (currentSignal == 2) and (lastTransactionType == 1):
            
            print("Perform Sell")
            
            #preventing too much loss
            currentClosingPrice = testDataframe.values[rowIndex,4]
            
            
                
            currentTimestamp = currentClosingPrice = testset['unixtime'][rowIndex]
            currentBudget = currentBitcoins * currentClosingPrice
            currentProfit = currentBudget - currentBudgetBeforeTrade
            sellProfits.append(currentProfit)
            sellTimestamps.append(currentTimestamp)
            budgetOverTime.append(currentBudget)
            currentBitcoins = 0
            
            lastTransactionType = 2
        #WAIT
        else:
            print("Perform Wait")
            
            
    

    overallAbsoluteProfit = budgetOverTime[len(budgetOverTime)-1] - startingBudget
    overallRelativeProfit = (budgetOverTime[len(budgetOverTime)-1] - startingBudget)/startingBudget
    
    print("Your absolute profit is: ",overallAbsoluteProfit, " | Your relative profit is: ",overallRelativeProfit)
    
    return [sellTimestamps, sellProfits, budgetOverTime]  



def validateTradingProfitWithFullIn_RuleBased_v2(testDataframe, 
                                                 startingBudget, 
                                                 minimumAcceptanceThreshold, 
                                                 maximumAcceptanceThreshold, 
                                                 stoplossActive, 
                                                 stoplossThreshold,
                                                 mfi_buy_threshold,
                                                 mfi_sell_threshold,
                                                 takerFeeActive,
                                                 takerFee):
    testDataframe["signal"] = None
    testDataframe["bitcoins"] = None
    testDataframe["budget"] = None
    testDataframe["profit_percent"] = None
    testDataframe["profit_absolute"] = None
    testDataframe["profitableTrade"] = None
    testDataframe["takerFeeLoss"] = None
    
    #timestamp, closing price, signal, bitcoins, budget
    lastBuyPrice =  None
    currentBudget = startingBudget
    currentBitcoins = 0
    previousSignal = None
    
    
    for rowIndex in range(1, len(testDataframe)):
        
        #BUY
        if (testDataframe.loc[rowIndex,"Histogram_Extrems"] == "Minimum" 
            and testDataframe.loc[rowIndex,"Histogram_Delta_Percentage"] > minimumAcceptanceThreshold
            and testDataframe.loc[rowIndex,"MFI"] <= mfi_buy_threshold
            and (previousSignal == None or previousSignal == "Sell")):
            
            currentClosingPrice = testDataframe.loc[rowIndex,"close"]
            
            if (takerFeeActive is True):
                currentBudget = currentBudget * (1 - takerFee)
            
            currentBitcoins = currentBudget/currentClosingPrice
            currentBudget = 0
            lastBuyPrice = currentClosingPrice
            
            testDataframe.loc[rowIndex,"signal"] = "Buy"
            testDataframe.loc[rowIndex,"bitcoins"] = currentBitcoins
            testDataframe.loc[rowIndex,"budget"] = currentBudget
            
            previousSignal = "Buy"
        
        #SELL
        elif (testDataframe.loc[rowIndex,"Histogram_Extrems"] == "Maximum" 
              and testDataframe.loc[rowIndex,"Histogram_Delta_Percentage"] < maximumAcceptanceThreshold 
              and testDataframe.loc[rowIndex,"MFI"] >= mfi_sell_threshold
              and previousSignal == "Buy"):
            
            currentClosingPrice = testDataframe.loc[rowIndex,"close"]
            #profit_percent = (currentClosingPrice - lastBuyPrice)/lastBuyPrice
            previousBudget =  (currentBitcoins * lastBuyPrice)
            currentBudget = (currentBitcoins * currentClosingPrice)
            
            if (takerFeeActive is True):
                currentBudget = currentBudget * (1 - takerFee)
            
            profit_percent = (currentBudget-previousBudget)/previousBudget
                
            
            testDataframe.loc[rowIndex,"profit_percent"] = profit_percent
            
            if ((stoplossActive is True) and profit_percent <= stoplossThreshold):
                print("Stoploss threshold ",stoplossThreshold, " exceeded with: ", profit_percent, " . Waiting for next sell point...")
                  
            else:     
                
                currentBitcoins = 0  
                
                
                testDataframe.loc[rowIndex,"signal"] = "Sell"
                testDataframe.loc[rowIndex,"bitcoins"] = currentBitcoins
                testDataframe.loc[rowIndex,"budget"] = currentBudget
                
                
                if (profit_percent <= 0):
                    testDataframe.loc[rowIndex,"profitableTrade"] = "No"
                else:
                    testDataframe.loc[rowIndex,"profitableTrade"] = "Yes"
                
                previousSignal = "Sell"
    

    #get all sell transactions
    sellDF = testDataframe[testDataframe['signal'] == "Sell"].reset_index(drop=True)
    lastSellBudget = sellDF.loc[len(sellDF)-1,"budget"]   
    numberProfitableTrades = len(testDataframe[testDataframe['profitableTrade'] == "Yes"])
    numberNoneProfitableTrades = len(testDataframe[testDataframe['profitableTrade'] == "No"])
    numberOftakerFeeLosses = len(testDataframe[testDataframe['takerFeeLoss'] == "Yes"])
    
    print("#################Trading Summary################")
    print("Last Sell Budget : ", lastSellBudget)
    print("Number of profitable trades : ", numberProfitableTrades)
    print("Number of none profitable trades : ", numberNoneProfitableTrades)
    print("->Number of loss due to taker fee: ", numberOftakerFeeLosses)
    print("#################End Trading Summary################")
    
    return [lastSellBudget, numberProfitableTrades, numberNoneProfitableTrades, testDataframe]
    
    
def validateTradingProfitWithFullIn_RuleBased_v3(testDataframe, 
                                                 startingBudget, 
                                                 stoplossActive, 
                                                 stoplossThreshold,
                                                 takerFeeActive,
                                                 takerFee):
    testDataframe["signal"] = None
    testDataframe["bitcoins"] = None
    testDataframe["budget"] = None
    testDataframe["profit_percent"] = None
    testDataframe["profit_absolute"] = None
    testDataframe["profitableTrade"] = None
    testDataframe["takerFeeLoss"] = None
    testDataframe["predictedExtrem"] = None
    
    #timestamp, closing price, signal, bitcoins, budget
    lastBuyPrice =  None
    currentBudget = startingBudget
    currentBitcoins = 0
    previousSignal = None

    
    
    for rowIndex in range(1, len(testDataframe)):
        
        
        #BUY
        if (testDataframe.loc[rowIndex,"Histogram"] > 0
            and (previousSignal == None or previousSignal == "Sell")):
            
            
            if (takerFeeActive is True):
                currentBudget = currentBudget * (1 - takerFee)
            
            currentClosingPrice = testDataframe.loc[rowIndex,"close"]
            
            currentBitcoins = currentBudget/currentClosingPrice
            currentBudget = 0
            lastBuyPrice = currentClosingPrice
            
            testDataframe.loc[rowIndex,"signal"] = "Buy"
            testDataframe.loc[rowIndex,"bitcoins"] = currentBitcoins
            testDataframe.loc[rowIndex,"budget"] = currentBudget
            
            previousSignal = "Buy"
        
        #SELL
        elif (testDataframe.loc[rowIndex,"Histogram"] < 0
              and previousSignal == "Buy"):
            
            
            currentClosingPrice = testDataframe.loc[rowIndex,"close"]
            #profit_percent = (currentClosingPrice - lastBuyPrice)/lastBuyPrice
            previousBudget =  (currentBitcoins * lastBuyPrice)
            currentBudget = (currentBitcoins * currentClosingPrice)
            
            if (takerFeeActive is True):
                currentBudget = currentBudget * (1 - takerFee)
            
            profit_percent = (currentBudget-previousBudget)/previousBudget
                
            
            testDataframe.loc[rowIndex,"profit_percent"] = profit_percent
            
            if ((stoplossActive is True) and profit_percent <= stoplossThreshold):
                print("Stoploss threshold ",stoplossThreshold, " exceeded with: ", profit_percent, " . Waiting for next sell point...")
                  
            else:     
                
                currentBitcoins = 0  
                
                
                testDataframe.loc[rowIndex,"signal"] = "Sell"
                testDataframe.loc[rowIndex,"bitcoins"] = currentBitcoins
                testDataframe.loc[rowIndex,"budget"] = currentBudget
                
                
                if (profit_percent <= 0):
                    testDataframe.loc[rowIndex,"profitableTrade"] = "No"
                else:
                    testDataframe.loc[rowIndex,"profitableTrade"] = "Yes"
                
                previousSignal = "Sell"
    

    #get all sell transactions
    sellDF = testDataframe[testDataframe['signal'] == "Sell"].reset_index(drop=True)
    lastSellBudget = sellDF.loc[len(sellDF)-1,"budget"]   
    numberProfitableTrades = len(testDataframe[testDataframe['profitableTrade'] == "Yes"])
    numberNoneProfitableTrades = len(testDataframe[testDataframe['profitableTrade'] == "No"])
    numberOftakerFeeLosses = len(testDataframe[testDataframe['takerFeeLoss'] == "Yes"])
    
    print("#################Trading Summary################")
    print("Last Sell Budget : ", lastSellBudget)
    print("Number of profitable trades : ", numberProfitableTrades)
    print("Number of none profitable trades : ", numberNoneProfitableTrades)
    print("->Number of loss due to taker fee: ", numberOftakerFeeLosses)
    print("#################End Trading Summary################")
    
    return [lastSellBudget, numberProfitableTrades, numberNoneProfitableTrades, testDataframe]



def validateTradingProfitWithFullIn_RuleBased_v4(testDataframe, 
                                                 startingBudget, 
                                                 sellProfitTrigger, 
                                                 stoplossActive, 
                                                 stoplossThreshold,
                                                 mfi_buy_threshold,
                                                 mfi_sell_threshold,
                                                 takerFeeActive,
                                                 takerFee):
    testDataframe["signal"] = None
    testDataframe["bitcoins"] = None
    testDataframe["budget"] = None
    testDataframe["potential_profit_percent"] = None
    testDataframe["profit_absolute"] = None
    testDataframe["profitableTrade"] = None
    testDataframe["takerFeeLoss"] = None
    
    #timestamp, closing price, signal, bitcoins, budget
    lastBuyPrice =  None
    currentBudget = startingBudget
    currentBitcoins = 0
    previousSignal = None
    potentialProfit = None
    
    
    for rowIndex in range(1, len(testDataframe)):
        
        currentClosingPrice = testDataframe.loc[rowIndex,"close"]
        
        if (lastBuyPrice is not None):
            potentialProfit = (currentClosingPrice-lastBuyPrice)/lastBuyPrice
            testDataframe.loc[rowIndex,"potential_profit_percent"] = potentialProfit
        
        #BUY
        if (testDataframe.loc[rowIndex,"Histogram_Extrems"] == "Minimum" 
            and testDataframe.loc[rowIndex,"MFI"] <= mfi_buy_threshold
            and (previousSignal == None or previousSignal == "Sell")):
            
            
            
            if (takerFeeActive is True):
                currentBudget = currentBudget * (1 - takerFee)
            
            currentBitcoins = currentBudget/currentClosingPrice
            currentBudget = 0
            lastBuyPrice = currentClosingPrice
            
            testDataframe.loc[rowIndex,"signal"] = "Buy"
            testDataframe.loc[rowIndex,"bitcoins"] = currentBitcoins
            testDataframe.loc[rowIndex,"budget"] = currentBudget
            
            previousSignal = "Buy"
        
        #SELL
        elif (potentialProfit is not None and potentialProfit >=  sellProfitTrigger
              and testDataframe.loc[rowIndex,"MFI"] >= mfi_sell_threshold
              and previousSignal == "Buy"):
            
            #profit_percent = (currentClosingPrice - lastBuyPrice)/lastBuyPrice
            previousBudget =  (currentBitcoins * lastBuyPrice)
            currentBudget = (currentBitcoins * currentClosingPrice)
            
            if (takerFeeActive is True):
                currentBudget = currentBudget * (1 - takerFee)
            
            profit_percent = (currentBudget-previousBudget)/previousBudget
                
            
            
            
            if ((stoplossActive is True) and profit_percent <= stoplossThreshold):
                print("Stoploss threshold ",stoplossThreshold, " exceeded with: ", profit_percent, " . Waiting for next sell point...")
                  
            else:     
                
                currentBitcoins = 0  
                
                
                testDataframe.loc[rowIndex,"signal"] = "Sell"
                testDataframe.loc[rowIndex,"bitcoins"] = currentBitcoins
                testDataframe.loc[rowIndex,"budget"] = currentBudget
                
                
                if (profit_percent <= 0):
                    testDataframe.loc[rowIndex,"profitableTrade"] = "No"
                else:
                    testDataframe.loc[rowIndex,"profitableTrade"] = "Yes"
                
                previousSignal = "Sell"
    

    #get all sell transactions
    sellDF = testDataframe[testDataframe['signal'] == "Sell"].reset_index(drop=True)
    lastSellBudget = sellDF.loc[len(sellDF)-1,"budget"]   
    numberProfitableTrades = len(testDataframe[testDataframe['profitableTrade'] == "Yes"])
    numberNoneProfitableTrades = len(testDataframe[testDataframe['profitableTrade'] == "No"])
    numberOftakerFeeLosses = len(testDataframe[testDataframe['takerFeeLoss'] == "Yes"])
    
    print("#################Trading Summary################")
    print("Last Sell Budget : ", lastSellBudget)
    print("Number of profitable trades : ", numberProfitableTrades)
    print("Number of none profitable trades : ", numberNoneProfitableTrades)
    print("->Number of loss due to taker fee: ", numberOftakerFeeLosses)
    print("#################End Trading Summary################")
    
    return [lastSellBudget, numberProfitableTrades, numberNoneProfitableTrades, testDataframe]