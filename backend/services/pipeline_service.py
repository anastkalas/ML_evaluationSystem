import uuid
from ml_pipeline.data_loader import load_dataset
from ml_pipeline.preprocessing import normalize_columns, split_df
from ml_pipeline.evaluation import evaluate_model
from ml_pipeline.conclusion import drawing_conclusion

# In-memory task store
TASK_RESULTS = {}


def run_pipeline(target_column: str, norm_cols: list) -> str:
    task_id = str(uuid.uuid4())

    X, y, target, data = load_dataset(target_column)
    data = normalize_columns(data, norm_cols)
    X_train, X_test, y_train, y_test = split_df(X, y)

    metrics = evaluate_model(X_train, X_test, y_train, y_test)
    conclusion = drawing_conclusion(metrics)

    TASK_RESULTS[task_id] = {
        "metrics": metrics,
        "conclusion": conclusion
    }

    return task_id


def get_results(task_id: str):
    return TASK_RESULTS.get(task_id)
