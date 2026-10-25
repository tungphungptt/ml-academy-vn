import test from "node:test"; import assert from "node:assert/strict";
import { makeLinear, gradientDescent, olsFit, makeBlobs, knnPredict, kmeansInit, kmeansStep, mse } from "../src/lib/ml";
test("GD hội tụ gần nghiệm OLS", () => {
  const d = makeLinear(); const g = gradientDescent(d, 0.01, 5000); const o = olsFit(d);
  assert.ok(Math.abs(g.w - o.w) < 0.05 && Math.abs(g.b - o.b) < 0.3); assert.ok(g.losses.at(-1)! <= g.losses[0]);
});
test("learning rate quá lớn gây phân kỳ", () => assert.equal(gradientDescent(makeLinear(), 0.2, 200).diverged, true));
test("OLS có MSE không lớn hơn w=0", () => { const d = makeLinear(); const o = olsFit(d); assert.ok(mse(d, o.w, o.b) < mse(d, 0, 0)); });
test("KNN phân loại đúng tâm cụm", () => {
  const t = makeBlobs([{ x: 0, y: 0 }, { x: 6, y: 6 }], 30, 0.8);
  assert.equal(knnPredict(t, { x: 0, y: 0 }, 5, 2), 0); assert.equal(knnPredict(t, { x: 6, y: 6 }, 5, 2), 1);
});
test("K-Means: inertia không tăng và hội tụ", () => {
  const p = makeBlobs([{ x: 0, y: 0 }, { x: 8, y: 8 }, { x: 0, y: 8 }], 30, 0.7);
  let c = kmeansInit(p, 3, 2), last = Infinity, done = false;
  for (let i = 0; i < 50 && !done; i++) { const s = kmeansStep(p, c); assert.ok(s.inertia <= last + 1e-9); last = s.inertia; c = s.centroids; done = s.converged; }
  assert.ok(done);
});
import { courseProgress, nextLesson } from "../src/lib/progress";
test("tiến độ và bài tiếp theo", () => {
  const ls = [{ id: "a", slug: "a", title: "A", hasContent: true }, { id: "b", slug: "b", title: "B", hasContent: false }, { id: "c", slug: "c", title: "C", hasContent: true }];
  assert.deepEqual(courseProgress(ls, new Set(["a"])), { total: 3, completed: 1, percent: 33 });
  assert.equal(nextLesson(ls, new Set(["a"]))?.id, "c"); assert.equal(nextLesson(ls, new Set(["a", "c"])), null);
});
