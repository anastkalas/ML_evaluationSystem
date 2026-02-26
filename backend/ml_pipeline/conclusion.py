import pandas as pd
import os

def drawing_conclusion():
    baseUrl = os.path.dirname(os.path.abspath(__file__))
    baseUrl = os.path.join(baseUrl, '..', 'classificationOutput.csv')
    results = pd.read_csv(baseUrl)

    model_statistics ={}

    grouped = results[results['Stage'] == "Crossval"].groupby('Model')
    for value in grouped:
        row = value[1]

        model_statistics[value[0]] = {
            "Mean ROC-AUC": row['ROC-AUC'].mean(),
            "STD ROC-AUC": row['ROC-AUC'].std()
        }

    best_model = None
    second_best_model = None
    best_mean = float('-inf')
    second_best_mean = float('-inf')
    best_std = float('inf')
    second_best_std = float('inf')

    for model, stats in model_statistics.items():
        mean = stats["Mean ROC-AUC"]
        std = stats["STD ROC-AUC"]

        if (mean > best_mean) or (mean == best_mean and std < best_std):
            best_model = model
            best_mean = mean
            best_std = std
    
    return [best_model, [model_statistics[best_model]]]