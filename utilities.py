# -*- coding: utf-8 -*-
"""
Created on Tue Dec 26 13:22:39 2017

@author: POverfeld
"""

import gdax
import pandas as pd
import numpy as np
from pyti.moving_average_convergence_divergence import moving_average_convergence_divergence as macd
from pyti.money_flow_index import money_flow_index as mfi
import time
import datetime




#############################
# RETRIEVE HISTORIC DATA
#############################
"""
RESPONSE ITEMS
Each bucket is an array of the following information:

1) time - bucket start time in unixtime seconds
2) low - lowest price during the bucket interval
3) high - highest price during the bucket interval
4) open - opening price (first trade) in the bucket interval
5) close - closing price (last trade) in the bucket interval
6) volume - volume of trading activity during the bucket interval (number of BTC traded)
7) date - uninix time to datetime conversion
"""
def getHistoricGdaxData(product, granularity):
    
    #load historc data in 15 min intervalls
    public_client = gdax.PublicClient()
    listResponse = public_client.get_product_historic_rates('BTC-EUR', granularity=granularity)
    listResponse.reverse();
    
    #create pandas dataframe from list
    labels = ["unixtime","low","high","open","close","volume"]
    df = pd.DataFrame.from_records(listResponse, columns=labels)
    df['datetime'] = (pd.to_datetime(df["unixtime"], unit='s'))
    
    return df


def getHistoricGdaxDataAdvanced(product, granularity, start, end):
    
    """
    - granularity in seconds
    - more than 200 rows of data not allowed, otherwise multiple requests needed
    - Number of rows = (unixtimeSeconds(end)-unixtimeSeconds(start))/granularity
    - unixtimeSeconds(end) = unixtimeSeconds(start) - (200 * granularity)
    """
    
    resultDataFrame = None
    
    #calulate needed number of rows
    print("# Downloading historic dataset...")
    
    starttimeUnix = int(time.mktime(datetime.datetime.strptime(start, "%Y-%m-%d %H:%M:%S").timetuple()))
    endtimeUnix = int(time.mktime(datetime.datetime.strptime(end, "%Y-%m-%d %H:%M:%S").timetuple()))
    #datetime.datetime.fromtimestamp(int(starttimeUnix)).strftime('%Y-%m-%d %H:%M:%S')
    numberOfRows = (endtimeUnix-starttimeUnix)/granularity
    
    #devide number of rows by 200 to get number of needed requests. Add one to retreive enough
    neededRequests = round(numberOfRows/200)+1
    
    #run requests and concatenate dataframes to a single response
    public_client = gdax.PublicClient()
    
    currentEndTimeUnix = endtimeUnix
    currentEndTimeDateTime = datetime.datetime.fromtimestamp(int(currentEndTimeUnix)).strftime('%Y-%m-%d %H:%M:%S')
    currentStartTimeUnix = currentEndTimeUnix-(200*granularity)
    currentStartTimeDateTime = datetime.datetime.fromtimestamp(int(currentStartTimeUnix)).strftime('%Y-%m-%d %H:%M:%S')
    
    for i in range(1, neededRequests+1):
        
        print("StartTimeUnix: ",currentStartTimeUnix, " | EndTimeUnix: ",currentEndTimeUnix)
        
        listResponse = list(public_client.get_product_historic_rates(product, granularity=granularity, start=currentStartTimeDateTime, end=currentEndTimeDateTime))
        listResponse.reverse();
        labels = ["unixtime","low","high","open","close","volume"]
        currentDataframe = pd.DataFrame.from_records(listResponse, columns=labels)
        
        if (resultDataFrame is None):
            resultDataFrame = currentDataframe
        else:
            resultDataFrame = currentDataframe.append(resultDataFrame)
        
        #shift start and endtime
        currentEndTimeUnix = currentStartTimeUnix
        currentEndTimeDateTime = datetime.datetime.fromtimestamp(int(currentEndTimeUnix)).strftime('%Y-%m-%d %H:%M:%S')
        currentStartTimeUnix = currentEndTimeUnix-(200*granularity)
        currentStartTimeDateTime = datetime.datetime.fromtimestamp(int(currentStartTimeUnix)).strftime('%Y-%m-%d %H:%M:%S')
        
        print("Current i value:", i)
    
    datetimeConverter = lambda x: datetime.datetime.fromtimestamp(int(x)).strftime('%Y-%m-%d %H:%M:%S')
    
    #resultDataFrame['intervallStart_datetime'] = (pd.to_datetime(resultDataFrame["unixtime"], unit='s'))
    resultDataFrame['intervallStart_datetime'] = resultDataFrame['unixtime'].apply(datetimeConverter)
    
    resultDataFrame = resultDataFrame.reset_index(drop=True)
    
    print("# Done, Downloading historic dataset")
    
    return resultDataFrame


#######################################
# CALCULATION OF INDICATORS / Features
#######################################

def generateFeatures(df):
    #typical price (high+low+close)/3
    high = df["high"].values
    low = df["low"].values
    close = df["close"].values
    
    # typical price
    typical_price_column = (high + low + close)/3
    df["typical_price"] = typical_price_column
    
    #calculate MACD Indicator and add to dataframe
    macd_column = macd(list(df["close"]), 12, 26)
    df["macd"] = macd_column
    
    #calculate MACD-Delta
    macd_delta_absolute_column = df["macd"].diff(periods=1)
    df["macd_delta_absolute"] = macd_delta_absolute_column
    
    
    macd_delta_percentage_column = (df["macd"].diff(periods=1))/df["macd"].shift(periods=1).abs()
    df["macd_delta_percentage"] = macd_delta_percentage_column
    
    #calculate money flow index and add to dataframe
    mfi_column = mfi(list(df["close"]), list(df["high"]), list(df["low"]), list(df["volume"]), 14)
    df["mfi"] = mfi_column
    
    #calculate MFI-Delta
    mfi_delta_absolute_column = df["mfi"].diff(periods=1)
    df["mfi_delta_absolute"] = mfi_delta_absolute_column
    
    mfi_delta_percentage_column = (df["mfi"].diff(periods=1))/df["mfi"].shift(periods=1).abs()
    df["mfi_delta_percentage"] = mfi_delta_percentage_column
    
    return df

############################
# Generate Target Variables
############################

def generateTargetVariables(df):
    # trend in 1 intervall
    df['trend_1_intervall'] = np.where(df['typical_price'].shift(-1)-df['typical_price']>=0, "UP", "DOWN")
    
    # trend in 2 intervalls
    df['trend_2_intervall'] = np.where(df['typical_price'].shift(-2)-df['typical_price']>=0, "UP", "DOWN")
    
    # trend in 3 intervalls
    df['trend_3_intervall'] = np.where(df['typical_price'].shift(-3)-df['typical_price']>=0, "UP", "DOWN")
    
    return df


    
    
    
    
    