import pandas as pd
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder

def preprocess_nsl_kdd(path):
    df = pd.read_csv(path)
    # Example preprocessing: fillna, encode categorical, normalize
    df.fillna(0, inplace=True)
    # ... Add encoding and scaling as needed
    return df
