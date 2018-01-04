# -*- coding: utf-8 -*-
"""
Created on Tue Dec 26 19:05:20 2017

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


def decisionTreeTrainingAndValidation(x_train, y_train, x_test, y_test):
        
    clf = tree.DecisionTreeClassifier()
    
    # we create an instance of Neighbours Classifier and fit the data.
    clf.fit(x_train, y_train)
    
    
    
    
    ####################################
    # MODEL EVALUATION
    ####################################
    
    # Make predictions
    y_predicted_test = clf.predict(x_test)
    
    # Evaluate accuracy
    print(accuracy_score(y_test, y_predicted_test))
    
    # Compute confusion matrix
    cnf_matrix = confusion_matrix(y_test, y_predicted_test)
    np.set_printoptions(precision=2)
    
    # Plot non-normalized confusion matrix
    plt.figure()
    charting.plot_confusion_matrix(cnf_matrix, classes=["Wait","Buy","Sell"],
                          title='Confusion matrix, without normalization')
    
    # Plot normalized confusion matrix
    plt.figure()
    charting.plot_confusion_matrix(cnf_matrix, classes=["Wait","Buy","Sell"], normalize=True,
                          title='Normalized confusion matrix')
    
    plt.show()
    
    tree.export_graphviz(clf, feature_names=["macd_delta_percentage","mfi"], class_names = ["Wait","Buy","Sell"], out_file='tree.dot')
    
    return