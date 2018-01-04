# -*- coding: utf-8 -*-
"""
Created on Tue Dec 26 15:22:19 2017

@author: POverfeld
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.finance import candlestick_ohlc
import itertools
import plotly as plotly
import plotly.graph_objs as go


def plotCharts(df):

    plt.close('all')
    
    #Reset the index to remove Date column from index
    df_quotes = df[['unixtime','open','high','low','close']]
    #df_quotes.columns = ['Date',"Open","High",'Low',"Close"]
    
    
    #Making plot
    #fig = plt.figure()
    ax1 = plt.subplot2grid((6,1), (0,0), rowspan=6, colspan=1)
    
    #Making candlestick plot
    candlestick_ohlc(ax1, df_quotes.values, width=0.4, colorup='#77d879', colordown='#db3f3f')
    #plt.ylabel("Price")
    #plt.legend()
    plt.setp(plt.gca().get_xticklabels(), rotation=45, horizontalalignment='right')
    
    
    # Three subplots, the axes array is 1-d
    f, axarr = plt.subplots(2, sharex=True)
    axarr[0].plot(df[['unixtime']].values, df[['macd']].values)
    axarr[0].set_title('macd')
    axarr[1].plot(df[['unixtime']].values, df[['mfi']].values)
    axarr[1].set_title('mfi')
    
    plt.show()
  
    
    
    
def plot_confusion_matrix(cm, classes,
                          normalize=False,
                          title='Confusion matrix',
                          cmap=plt.cm.Blues):
    """
    This function prints and plots the confusion matrix.
    Normalization can be applied by setting `normalize=True`.
    """
    if normalize:
        cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        print("Normalized confusion matrix")
    else:
        print('Confusion matrix, without normalization')

    print(cm)

    plt.imshow(cm, interpolation='nearest', cmap=cmap)
    plt.title(title)
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45)
    plt.yticks(tick_marks, classes)

    fmt = '.2f' if normalize else 'd'
    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, format(cm[i, j], fmt),
                 horizontalalignment="center",
                 color="white" if cm[i, j] > thresh else "black")

    plt.tight_layout()
    plt.ylabel('True label')
    plt.xlabel('Predicted label')




'''
Author: Philipp Overfeld

Description:
    tradedDF: Dataframe with at least the columns: 
        "intervallStart_datetime", 
        "close",
        "Histogram",
        "MFI",
        "budget"
        "signal" ("Buy","Sell","") 
'''
def plotBacktestingAnalysis(tradedDF):
    
    buySignals=tradedDF[tradedDF['signal'] == "Buy"].reset_index(drop=True) 
    sellSignals=tradedDF[tradedDF['signal'] == "Sell"].reset_index(drop=True)
    
    Budget = go.Scatter(
        x=sellSignals["intervallStart_datetime"],
        y=sellSignals["budget"],
        text=np.around(list(sellSignals["budget"]),4),
        yaxis='y4',
        name='Budget After Sell',
        mode="lines+markers+text",
        textposition='bottom',
        fill='tonexty'
    )
    
    Close_Price = go.Scatter(
        x=tradedDF["intervallStart_datetime"],
        y=tradedDF["close"],
        yaxis='y3',
        name='Close Price'
    )
    
    Buy_Signals = go.Scatter(
        x=buySignals["intervallStart_datetime"],
        y=buySignals["close"],
        yaxis='y3',
        name='Buy Signals',
        mode='markers+text',
        text=buySignals["signal"],
        textposition='bottom',
        marker=dict(size=12,
                    line=dict(width=1),
                    color="green",
                    symbol= 'triangle-up'
                   )
    )
    
    Sell_Signals = go.Scatter(
        x=sellSignals["intervallStart_datetime"],
        y=sellSignals["close"],
        yaxis='y3',
        name='Sell Signals',
        mode='markers+text',
        text=sellSignals["signal"],
        textposition='bottom',
        marker=dict(size=12,
                    line=dict(width=1),
                    color="red",
                    symbol= 'triangle-down'
                   )
    )
    
    MACD_Histogram = go.Scatter(
        x=tradedDF["intervallStart_datetime"],
        y=tradedDF["Histogram"],
        yaxis='y2',
        name='MACD Histogram',
        type='bar'
    )
    MFI = go.Scatter(
        x=tradedDF["intervallStart_datetime"],
        y=tradedDF["MFI"],
        yaxis='y1',
        name='MFI'
        
    )
    data = [Budget, Close_Price, Buy_Signals, Sell_Signals, MACD_Histogram, MFI]
    layout = go.Layout(
        yaxis=dict(
            domain=[0, 0.15],
            title='MFI'
        ),
        yaxis2=dict(
            domain=[0.15, 0.30],
            title='MACD Histogram'
        ),
        yaxis3=dict(
            domain=[0.30, 0.85],
            title='Close Price'
        ),
        yaxis4=dict(
            domain=[0.85, 1],
            title='Budget' 
        ),
        title='Backtesting Analysis'
        
    )
    fig = go.Figure(data=data, layout=layout)
    plotly.offline.plot(fig, filename='stacked-subplots-shared-x-axis')

    return print("Please open browser")