import pandas as pd
from sklearn.utils import resample
from sklearn.model_selection import train_test_split

def normalize_columns(df, norm_cols): 
    print("\nNumeric columns available:")
    numeric_cols = df.select_dtypes(include=[int, float]).columns.tolist()
    print(numeric_cols)

    selected_cols = [c.strip() for c in norm_cols]

    for col in selected_cols:
        if col in df.columns:
            # --- ΕΝΣΩΜΑΤΩΣΗ ΛΥΣΗΣ 2: Διαχείριση NaN ---
            # Επιλογή Α: Γέμισμα κενών με τη μέση τιμή της στήλης (προτεινόμενο για normalization)
            if df[col].isnull().any():
                print(f"Filling missing values in column: {col}")
                df[col] = df[col].fillna(df[col].mean())
            
            # Υπολογισμός min/max
            xmin, xmax = df[col].min(), df[col].max()
            
            # Κανονικοποίηση
            if xmax != xmin:
                df[col] = df[col].apply(lambda x: (x - xmin)/(xmax - xmin))
            else:
                df[col] = 0
        else:
            print(f"Warning: Column {col} not found in DataFrame.")

    return df

def split_df(X, y):# function to split features and target into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, shuffle=True
    )# split with 80-20 ratio
    return X_train, X_test, y_train, y_test