import pandas as pd
from pathlib import Path
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def metricsAvg():
    BACKEND_DIR = Path(__file__).resolve().parent.parent
    csv_path = BACKEND_DIR / "classificationOutput.csv"

    df = pd.read_csv(csv_path)
    df_roc_auc = df.groupby(['Model'])['ROC-AUC'].mean()
    df_others = df.groupby(['Model'])[df.columns[4:-1]].sum()
    df = df_others.join(df_roc_auc)
    
    metrics = {}

    # metrics Accuracy, Precision, Recall, F1-Score,       ROC-AUC
    for i in range(len(df)):
        row_data = df.iloc[i, 0:] # .iloc[row_index, column_range]
        tp = 0
        tn = 0
        fp = 0
        fn = 0
        model = row_data.name

        for col in row_data.index:
            if "TP" in col:
                tp += row_data[col]
            elif "TN" in col:
                tn += row_data[col]
            elif "FP" in col:
                fp += row_data[col]
            elif "FN" in col:
                fn += row_data[col]
            else:
                roc = row_data[col]
        # print(row_data)
        metrics[model] = [round((tp+tn)/(tp+fp+fn+tn), 3), round(tp/(tp+fp), 3), round(tp/(tp+fn), 3), round((tp/(tp+fp) * tp/(tp+fn))/tp/(tp+fp) + tp/(tp+fn), 3), round(roc, 3)]
    # print(len(df))
    print(metrics)
    return metrics