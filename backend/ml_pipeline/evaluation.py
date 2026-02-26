import pandas as pd
from ml_pipeline.preprocessing import *
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import confusion_matrix, roc_auc_score
from services import config_service
import os

def evaluate_model(X_train, X_test, y_train, y_test, folds=2):
    """
    Evaluate multiple classification models by:
      1) Stratified K-fold CV on (X_train, y_train), collecting per-fold results.
      2) Final training on full training set, then evaluation on (X_test, y_test).
    Returns a pandas DataFrame with results.
    
    Parameters:
      X_train, X_test : pandas.DataFrame
      y_train, y_test : pandas.Series or array-like
      folds : int, number of CV folds
      random_state : int, seed for reproducibility
      output_csv_path : str or None — if provided, will save results to CSV.
    """
    skf = StratifiedKFold(n_splits=folds, shuffle=True, random_state=42) # create Stratified K-Fold splitter
    
    algs_parameters = config_service.get_hyperparameters()  # retrieve hyperparameter configuration
    print("Using hyperparameters:", algs_parameters)

    svc_params = algs_parameters["svc"]
    svc_params["probability"] = True  # Ensure it's set to True in the dict
    
    models = {
        "LDA": LinearDiscriminantAnalysis(**algs_parameters["lda"]),
        "Logistic Regression": LogisticRegression(**algs_parameters["logistic_regression"]),
        "Decision Tree": DecisionTreeClassifier(**algs_parameters["decision_tree"]),
        "Random Forest": RandomForestClassifier(**algs_parameters["random_forest"]),
        "kNN": KNeighborsClassifier(**algs_parameters["knn"]),
        "Naive Bayes": GaussianNB(**algs_parameters["gaussian_nb"]),
        "SVC": SVC(**svc_params) # Add probability=True here
    }
    
    labels = sorted(y_train.astype(str).unique()) # get sorted unique class labels from training target
    metrics_per_class = ["TP", "FP", "FN", "TN"] # define confusion matrix metrics
    cm_cols = [f"{metric}{i+1}" for i in range(len(labels)) for metric in metrics_per_class] # create column names for metrics per class

    columns = ["Stage", "Fold", "Model", "Set"] + cm_cols + ["ROC-AUC"] # define full result dataframe columns
    results = pd.DataFrame(columns=columns)
    
    # 1) Cross-Validation on training data
    for f, (tr_idx, val_idx) in enumerate(skf.split(X_train, y_train), start=1): #iterate over CV folds
        """
            X_tr: Feature data used for training the model during each cross-validation fold.
            X_val: Feature data used for validating the model during each cross-validation fold.
            y_tr: Target labels corresponding to X_tr for training the model.
            y_val: Target labels corresponding to X_val for validating the model.
        """

        X_tr, X_val = X_train.iloc[tr_idx], X_train.iloc[val_idx]
        y_tr, y_val = y_train.iloc[tr_idx], y_train.iloc[val_idx]

        for name, model in models.items():
            model.fit(X_tr, y_tr) # train model on current fold's training data
            y_pred = model.predict(X_val) # predict labels for validation split

            if hasattr(model, "predict_proba"): # check if model support probability predictions
                try:
                    y_prob = model.predict_proba(X_val) # attempt to get predicted probabilities for validation set
                except Exception:
                    y_prob = None
            else:
                y_prob = None
            
            cm = confusion_matrix(y_val, y_pred, labels=labels) # compute confusion matrix for validation predictions
            per_class = [] # list to hold per-class metrics
            for i in range(len(labels)):
                TP = cm[i, 1] # True Positives for class i when using binary-index interpretation 
                FP = cm[:, 1].sum() - TP # False Positives for class i from column sums minus TP
                FN = cm[i, :].sum() - TP # False Negatives for class i from row sums minus TP
                TN = cm.sum() - (TP + FP + FN) # True Negatives for class i from total sum minus other metrics
                per_class.extend([TP, FP, FN, TN]) # append metrics for class i

            if y_prob is not None: # if probability predictions are available calculate ROC-AUC
                if y_prob.shape[1]==2: # binary classification case with two probability columns
                    y_score = y_prob[:, 1] # use probability of positive class
                    roc = roc_auc_score(y_val, y_score) # compute ROC-AUC score
                else:
                    roc = roc_auc_score(y_val, y_prob, multi_class="ovr", average="macro") # multi-class ROC-AUC
            else:
                roc = None

            results.loc[len(results)] = [ # add a new row to results DataFrame
                "Crossval", f, name, "Validation",
                *per_class,
                roc
            ]
    
    # 2) Final evaluation on test set, using each model trained on full training data
    for name, model in models.items():
        model.fit(X_train, y_train) # train model on the entire training data
        y_pred = model.predict(X_test) # predict labels for the test set

        if hasattr(model, "predict_proba"): # check if model supports probability predictions
            try:
                y_prob = model.predict_proba(X_test) # attempt to get predicted probabilities for test set
            except Exception:
                y_prob = None
        else:
            y_prob = None

        cm = confusion_matrix(y_test, y_pred, labels=labels) # compute confusion matrix for test predictions
        per_class=[]
        for i in range(len(labels)): # iterate over each class to compute metrics
            TP = cm[i, i] # True Positives for class i
            FP = cm[:, i].sum() - TP # False Positives for class i
            FN = cm[i, :].sum() - TP# False Negatives for class i
            TN = cm.sum() - (TP + FP + FN) # True Negatives for class i
            per_class.extend([TP, FP, FN, TN]) # append metrics for class i

        if y_prob is not None: # if probability predictions are available calculate ROC-AUC
            if y_prob.shape[1] == 2: # binary classification case
                y_score = y_prob[:, 1] # use probability of positive class
                roc = roc_auc_score(y_test, y_score) # compute ROC-AUC score
            else:
                roc = roc_auc_score(y_test, y_prob, multi_class="ovr", average="macro") # multi-class ROC-AUC
        else:
            roc = None

        results.loc[len(results)] = [
            "FinalTest", None, name, "Test",
            *per_class,
            roc
        ]
        
        results.to_csv("classificationOutput.csv", index=False)

    return results