# -*- coding: utf-8 -*-
"""
Created on Tue Jan  2 13:01:33 2018

@author: POverfeld
"""

from pyti.moving_average_convergence_divergence import moving_average_convergence_divergence as macd
from pyti.money_flow_index import money_flow_index as mfi
import pandas as pd

def addMFIColumn(df):
    
    #typical price (high+low+close)/3
    high = df["high"].values
    low = df["low"].values
    close = df["close"].values
    
    #calculate money flow index and add to dataframe
    mfi_column = mfi(list(df["close"]), list(df["high"]), list(df["low"]), list(df["volume"]), 14)
    df["MFI"] = mfi_column
    
    #mfi_delta_percentage_column = (df["mfi"].diff(periods=1))/df["mfi"].shift(periods=1).abs()
    #df["MFI_Delta_Percentage"] = mfi_delta_percentage_column
    
    return df


def calculateSingleEMA(currentClose, previousEMA, span):
       return currentClose * (2/(span+1)) + previousEMA * (1-(2/(span+1)))

def addMACDHistogramColumns(dataframe):
    
    df = dataframe.copy()
    
    #add EMA_12
    df["EMA_12"] = None
    df.loc[11, ["EMA_12"]] = df.loc[0:11,"close"].mean()
    
    for rowIndex in range(12,len(df)):
        currentEMA_12 = calculateSingleEMA(currentClose = df.loc[rowIndex,"close"], previousEMA = df.loc[rowIndex-1, "EMA_12"], span = 12) 
        df.loc[rowIndex, ["EMA_12"]] = currentEMA_12
    
    #add EMA 26
    df["EMA_26"] = None
    df.loc[25, ["EMA_26"]] = df.loc[0:25,"close"].mean()
    
    for rowIndex in range(26,len(df)):
        currentEMA_26 = calculateSingleEMA(currentClose = df.loc[rowIndex,"close"], previousEMA = df.loc[rowIndex-1, "EMA_26"], span = 26) 
        df.loc[rowIndex, ["EMA_26"]] = currentEMA_26
    
    #add MACD
    df["MACD"] = df["EMA_12"] - df["EMA_26"]
    
    #add Signal Line
    df["Signal_Line"] = None
    df.loc[33, ["Signal_Line"]] = df.loc[25:33,"MACD"].mean()
    
    for rowIndex in range(34,len(df)):
        currentSignalLine = calculateSingleEMA(currentClose = df.loc[rowIndex,"MACD"], previousEMA = df.loc[rowIndex-1, "Signal_Line"], span = 9) 
        df.loc[rowIndex, ["Signal_Line"]] = currentSignalLine
    
    #add Histogram
    df["Histogram"] = df["MACD"] - df["Signal_Line"]
    
    #add Histogram delta percentage
    df["Histogram_Delta_Percentage"] = (df["Histogram"].diff(periods=1))/df["Histogram"].shift(periods=1).abs()
    
    #add histogram extrems
    df["Histogram_Extrems"] = None
    for rowIndex in range(35,len(df)):
        currentTradeSignal = None
        previousDelta = df.loc[rowIndex-1,"Histogram_Delta_Percentage"]
        currentDelta = df.loc[rowIndex,"Histogram_Delta_Percentage"]
        
        if (previousDelta <= 0 and currentDelta > 0):
            currentTradeSignal = "Minimum"
        elif (previousDelta >= 0 and currentDelta < 0):
            currentTradeSignal = "Maximum"
        else:
            currentTradeSignal = ""
        
        df.loc[rowIndex, ["Histogram_Extrems"]] = currentTradeSignal
    
    
    return df


