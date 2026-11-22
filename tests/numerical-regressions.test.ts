import test from "node:test";
import assert from "node:assert/strict";
import { gradientDescent, makeLinear, mse, olsFit, knnPredict, kmeansInit } from "../src/lib/ml";
import { buildTree, treePredict, pca2, trainMLP, makeXor } from "../src/lib/ml2";

test("divergence keeps weights and reported MSE at the same last safe step", () => {
  const data = makeLinear(), model = gradientDescent(data, 1, 100);
  assert.equal(model.diverged, true);
  assert.equal(mse(data, model.w, model.b), model.losses.at(-1));
  assert.ok(Number.isFinite(model.w) && Number.isFinite(model.b));
});
test("OLS for a constant feature predicts the mean without NaN", () => {
  assert.deepEqual(olsFit([{ x: 2, y: 1 }, { x: 2, y: 5 }]), { w: 0, b: 3 });
});
test("CART can discover XOR after an initial zero-gain split", () => {
  const data = [{ x: 0, y: 0, label: 0 }, { x: 1, y: 1, label: 0 }, { x: 0, y: 1, label: 1 }, { x: 1, y: 0, label: 1 }];
  const tree = buildTree(data, 2);
  assert.deepEqual(data.map(p => treePredict(tree, p)), data.map(p => p.label));
});
test("PCA stays finite on zero variance and an almost vertical principal direction", () => {
  const zero = pca2([{ x: 2, y: 3 }, { x: 2, y: 3 }]);
  assert.equal(zero.ratio, 0);
  assert.deepEqual(zero.values, [0, 0]);
  const vertical = pca2([{ x: 1e-20, y: 1 }, { x: 2e-20, y: 2 }, { x: 3e-20, y: 3 }]);
  assert.ok(vertical.pc1.every(Number.isFinite));
  assert.ok(Math.abs(vertical.pc1[1]) > .999);
  assert.ok(vertical.values.every(v => v >= 0));
});
test("MLP loss matches the returned model, including the initial state", () => {
  const data = makeXor(4), model = trainMLP(data, 4, .5, 10);
  const independent = data.reduce((s, d) => { const p = model.predict(d.x, d.y); return s - d.label * Math.log(p) - (1 - d.label) * Math.log(1 - p); }, 0) / data.length;
  assert.ok(Math.abs(independent - model.losses.at(-1)!) < 1e-12);
  assert.equal(model.losses.length, 11);
});
test("undefined educational inputs fail explicitly instead of showing NaN", () => {
  for (const run of [() => mse([], 0, 0), () => olsFit([]), () => pca2([]), () => knnPredict([], { x: 0, y: 0 }, 0, 2), () => kmeansInit([], 2), () => trainMLP([], 4, .5, 10)]) assert.throws(run, RangeError);
});
