# -*- coding: utf-8 -*-
"""
Created on Sun Dec 24 16:19:11 2017

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
import modelvalidation as modelvalidation
from sklearn import svm
import featureGeneration as featureGeneration


###########################
#load historic data
###########################
'''
#load raw data
df_15min_raw = utilities.getHistoricGdaxDataAdvanced(product = 'BTC-EUR', granularity = 900, start = "2017-12-10 10:00:00", end = "2017-12-29 13:00:00")
df_15min_raw.to_csv("exports/trainsets/training_15min_intervall_raw.csv", sep='\t', index=False)


df_5min_raw = utilities.getHistoricGdaxDataAdvanced(product = 'BTC-EUR', granularity = 300, start = "2017-12-10 10:00:00", end = "2017-12-29 13:00:00")
df_5min_raw.to_csv("exports/trainsets/training_5min_intervall_raw.csv", sep='\t', index=False)


df_1min_raw = utilities.getHistoricGdaxDataAdvanced(product = 'BTC-EUR', granularity = 60, start = "2017-12-10 10:00:00", end = "2017-12-29 13:00:00")
df_1min_raw.to_csv("exports/trainsets/training_1min_intervall_raw.csv", sep='\t', index=False)


#add features/indicators

df_15min_features = pd.read_csv("exports/trainsets/training_15min_intervall_raw.csv", sep='\t')
df_15min_features = featureGeneration.addMACDHistogramColumns(df_15min_features)
df_15min_features = featureGeneration.addMFIColumn(df_15min_features)
df_15min_features.to_csv("exports/trainsets/training_15min_intervall_features.csv", sep='\t', index=False)

df_5min_features = pd.read_csv("exports/trainsets/training_5min_intervall_raw.csv", sep='\t')
df_5min_features = featureGeneration.addMACDHistogramColumns(df_5min_features)
df_5min_features = featureGeneration.addMFIColumn(df_5min_features)
df_5min_features.to_csv("exports/trainsets/training_5min_intervall_features.csv", sep='\t', index=False)

df_1min_features = pd.read_csv("exports/trainsets/training_1min_intervall_raw.csv", sep='\t')
df_1min_features = featureGeneration.addMACDHistogramColumns(df_1min_features)
df_1min_features = featureGeneration.addMFIColumn(df_1min_features)
df_1min_features.to_csv("exports/trainsets/training_1min_intervall_features.csv", sep='\t', index=False)

#df = utilities.generateFeatures(df)
#df = utilities.generateTargetVariables(df)    
'''
###########################
#load from .csv
###########################

df_15min_features = pd.read_csv("exports/trainsets/training_15min_intervall_features.csv", sep='\t')
df_15min_features_cleaned = df_15min_features.iloc[35:,:].reset_index(drop=True)

df_5min_features = pd.read_csv("exports/trainsets/training_5min_intervall_features.csv", sep='\t')
df_5min_features_cleaned = df_5min_features.iloc[35:,:].reset_index(drop=True)

df_1min_features = pd.read_csv("exports/trainsets/training_1min_intervall_features.csv", sep='\t')
df_1min_features_cleaned = df_1min_features.iloc[35:,:].reset_index(drop=True)



###########################
#plot graphs
###########################

#charting.plotCharts(df_15min_features)


'''
###########################
#train machine learning models
###########################

#load train set
df_train = pd.read_csv('exports/trainsets/train.csv', sep=";", header = 0, decimal =",")

x_train = df_train.values[:,10:12]
y_train = list(df_train.values[:,17])
    
x_test = x_train
y_test = y_train

#Random Forrest
clf = RandomForestClassifier(n_estimators=20)
clf = clf.fit(x_train, y_train)


#result = [lastSellBudget, numberProfitableTrades, numberNoneProfitableTrades, testDataframe]
result = modelvalidation.validateTradingProfitWithFullIn_RuleBased_v2(testDataframe = df_1min_features_cleaned, 
                                                                      startingBudget = 100, 
                                                                      minimumAcceptanceThreshold = 0.05, 
                                                                      maximumAcceptanceThreshold = -0.05, 
                                                                      stoplossActive = True, 
                                                                      stoplossThreshold = 0.01,
                                                                      mfi_buy_threshold = 100,
                                                                      mfi_sell_threshold = 0,
                                                                      takerFeeActive = True,
                                                                      takerFee = 0.0025)
'''
result = modelvalidation.validateTradingProfitWithFullIn_RuleBased_v4(testDataframe = df_15min_features_cleaned.iloc[:,:].reset_index(drop=True), 
                                                                      startingBudget = 100,
                                                                      sellProfitTrigger = 0.05,
                                                                      stoplossActive = True, 
                                                                      stoplossThreshold = -0.01,
                                                                      mfi_buy_threshold = 100,
                                                                      mfi_sell_threshold = 0,
                                                                      takerFeeActive = True,
                                                                      takerFee = 0.0025)

tradedDF = result[3]

#tradedDF.to_csv("exports/analysis/tradedDF.csv", sep='\t', index=False)


charting.plotBacktestingAnalysis(tradedDF = tradedDF)



