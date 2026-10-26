"""Numerical regressions for reviewed lesson examples and matching quiz contracts."""
import contextlib
import io
import json
from pathlib import Path
import re
import unittest
from unittest.mock import patch

import numpy as np
from sklearn.linear_model import Ridge
from sklearn.svm import SVC

ROOT = Path(__file__).resolve().parents[1]

def example(slug, number=0):
    source = (ROOT/'content/lessons'/f'{slug}.md').read_text()
    blocks = re.findall(r'^```python\n(.*?)^```', source, re.M | re.S)
    namespace = {}
    with contextlib.redirect_stdout(io.StringIO()):
        exec(compile(blocks[number], slug, 'exec'), namespace)
    return namespace

class ReviewedMath(unittest.TestCase):
    def test_ridge_rank_deficient_example_matches_sklearn(self):
        ns = example('ridge-lasso')
        X, y = ns['X_singular'], ns['y']
        with self.assertRaises(np.linalg.LinAlgError):
            np.linalg.inv(X.T @ X)
        reference = Ridge(alpha=1., fit_intercept=False).fit(X, y).coef_
        np.testing.assert_allclose(ns['ridge_solution'], reference, atol=1e-10)
        np.testing.assert_allclose(X @ np.linalg.lstsq(X, y, rcond=None)[0], y)

    def test_grid_search_cv_quiz_excludes_the_actual_extra_refit(self):
        calls = 0
        original_fit = SVC.fit
        def counted_fit(estimator, *args, **kwargs):
            nonlocal calls
            calls += 1
            return original_fit(estimator, *args, **kwargs)
        with patch.object(SVC, 'fit', counted_fit):
            search = example('hyperparameter-tuning')['g']
        cv_fits = search.n_splits_ * len(search.cv_results_['params'])
        question = json.loads((ROOT/'content/quizzes/hyperparameter-tuning.json').read_text())[0]
        self.assertIn('không tính refit', question['prompt'])
        self.assertEqual(int(question['options'][question['correct']]), cv_fits)
        self.assertEqual(cv_fits, 30)
        self.assertEqual(calls, cv_fits + 1)

    def test_sigmoid_bound_requires_weight_norm(self):
        # Scalar depth-2 network at zero: each sigmoid'=.25, weights=8.
        # Full derivative=(8*.25)^2=4, not bounded by .25^2.
        import torch
        x = torch.tensor(0., requires_grad=True)
        h = torch.sigmoid(8*x)
        y = torch.sigmoid(8*(h-.5))
        y.backward()
        self.assertAlmostEqual(x.grad.item(), 4.)
        self.assertGreater(x.grad.item(), .25**2)
        # Without the weights, the activation-only bound remains valid.
        z = np.linspace(-20, 20, 1001)
        p = 1/(1+np.exp(-z))
        self.assertLessEqual(float(np.max(p*(1-p))), .25)

if __name__ == '__main__':
    unittest.main()
