"""Synthetic mixed table: train-only EDA, fold-safe imputation/selection and evaluation."""
import json
import os
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.feature_selection import SelectPercentile, f_classif
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, RobustScaler

rng = np.random.default_rng(7)
age = rng.uniform(18, 70, 500)
income = rng.lognormal(10, .5, 500)
y = (income/20000 + (age-40)/20 + rng.normal(0, .25, 500) > 1.5).astype(int)
X = pd.DataFrame({'age': age, 'income': income, 'city': rng.choice(['Bắc', 'Trung', 'Nam'], 500)})
# Measurement corruption, not evidence that all high incomes are wrong.
X.loc[:4, 'income'] *= 20
X.loc[rng.choice(500, 40, replace=False), 'income'] = np.nan
X.loc[rng.choice(500, 30, replace=False), 'city'] = np.nan
tr, te = train_test_split(np.arange(len(y)), test_size=.25, random_state=7, stratify=y)
X.loc[te[:5], 'city'] = 'Chưa từng gặp'
pre = ColumnTransformer([
    ('num', make_pipeline(SimpleImputer(strategy='median', add_indicator=True), RobustScaler()), ['age', 'income']),
    ('cat', make_pipeline(SimpleImputer(strategy='most_frequent'), OneHotEncoder(handle_unknown='ignore', sparse_output=False)), ['city'])
])
model = make_pipeline(pre, SelectPercentile(f_classif, percentile=80), LogisticRegression(max_iter=1500))
cv = StratifiedKFold(4, shuffle=True, random_state=7)
cv_auc = cross_val_score(model, X.iloc[tr], y[tr], scoring='roc_auc', cv=cv)
model.fit(X.iloc[tr], y[tr])
prob = model.predict_proba(X.iloc[te])[:, 1]
assert np.isfinite(prob).all()
baseline = DummyClassifier(strategy='prior').fit(X.iloc[tr], y[tr])
q1, q3 = X.iloc[tr].income.quantile([.25, .75])
outliers = (X.iloc[tr].income > q3 + 1.5*(q3-q1)).sum()
out = Path(os.environ.get('ML_ACADEMY_OUTPUT_DIR', '.local/curriculum-output'))
out.mkdir(parents=True, exist_ok=True)
X.iloc[tr].isna().mean().plot.bar()
plt.ylabel('Missing fraction in train'); plt.tight_layout(); plt.savefig(out/'missing-train.png'); plt.close()
print(json.dumps({'baseline_auc': round(roc_auc_score(y[te], baseline.predict_proba(X.iloc[te])[:, 1]), 4), 'cv_auc_mean': round(float(cv_auc.mean()), 4), 'test_auc': round(roc_auc_score(y[te], prob), 4), 'test_f1': round(f1_score(y[te], prob >= .5), 4), 'train_outlier_flags': int(outliers), 'train_samples': len(tr), 'test_samples': len(te)}, sort_keys=True))
