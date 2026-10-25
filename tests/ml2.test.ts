import test from "node:test"; import assert from "node:assert/strict";
import { makeCloud, pca2, gini, buildTree, treePredict, makeXor, trainMLP } from "../src/lib/ml2";
import { makeBlobs } from "../src/lib/ml"; import { gradeQuiz } from "../src/lib/quiz";
test("PCA: vector đơn vị, trực giao, tỉ lệ trong (0,1]", () => {
  const r = pca2(makeCloud()); assert.ok(Math.abs(Math.hypot(...r.pc1) - 1) < 1e-9); assert.ok(Math.abs(r.pc1[0] * r.pc2[0] + r.pc1[1] * r.pc2[1]) < 1e-9);
  assert.ok(r.values[0] >= r.values[1] && r.ratio > 0.5 && r.ratio <= 1);
});
test("PCA khớp ví dụ (1,1),(2,2),(3,3): trị riêng 2 và 0", () => {
  const r = pca2([{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }]); assert.ok(Math.abs(r.values[0] - 2) < 1e-9 && Math.abs(r.values[1]) < 1e-9);
});
test("Gini khớp ví dụ bài học", () => {
  const L = (l: number) => ({ x: 0, y: 0, label: l }); assert.equal(gini([L(0), L(0), L(0), L(1), L(1), L(1)]), 0.5); assert.equal(gini([L(0), L(0), L(0), L(1)]), 0.375);
});
test("Cây sâu hơn không tệ hơn trên tập train", () => {
  const d = makeBlobs([{ x: 3, y: 3 }, { x: 6, y: 6 }], 30, 1.3, 2); const acc = (t: number) => d.filter(p => treePredict(buildTree(d, t), p) === p.label).length / d.length;
  assert.ok(acc(1) <= acc(4)); assert.ok(acc(6) > 0.95);
});
test("MLP giải XOR với 4 neuron ẩn, 1 neuron ẩn thì không", () => {
  const d = makeXor(); const a = trainMLP(d, 4, 0.5, 1500, 1); assert.ok(a.accuracy > 0.95); assert.ok(a.losses.at(-1)! < a.losses[0]);
  assert.ok(trainMLP(d, 1, 0.5, 1500, 1).accuracy < 0.85);
});
test("chấm quiz", () => {
  const g = gradeQuiz([{ id: "a", correctIndex: 1, explanation: "" }, { id: "b", correctIndex: 0, explanation: "" }], { a: 1, b: 2 });
  assert.equal(g.score, 1); assert.equal(g.total, 2); assert.equal(g.results[1].correct, false);
});
import { validateResource } from "../src/lib/validation";
test("validateResource", () => {
  const good = { title: "T", description: "D", topic: "ML", kind: "docs", url: "https://example.com/x" };
  assert.equal(validateResource(good).ok, true);
  assert.equal(validateResource({ ...good, url: "http://example.com" }).ok, false);
  assert.equal(validateResource({ ...good, url: "javascript:alert(1)" }).ok, false);
  assert.equal(validateResource({ ...good, kind: "x" }).ok, false);
  assert.equal(validateResource({ ...good, title: "  " }).ok, false);
  assert.equal(validateResource(null).ok, false);
});
import { tokenize } from "../src/lib/highlight";
test("tô màu cú pháp: không mất ký tự và phân loại đúng", () => {
  const code = 'for i in range(3):  # lặp\n    s = "a # b" + \'c\'\n    x = 1.5e-3\nformat = 2\n"""doc\nstring"""';
  const t = tokenize(code); assert.equal(t.map(k => k.t).join(""), code);
  const kind = (s: string) => t.find(k => k.t === s)?.c;
  assert.equal(kind("for"), "kw"); assert.equal(kind("in"), "kw"); assert.equal(kind("# lặp"), "com");
  assert.equal(kind('"a # b"'), "str"); assert.equal(kind("1.5e-3"), "num"); assert.equal(kind("format"), ""); assert.equal(kind('"""doc\nstring"""'), "str");
});
import { validateDataset } from "../src/lib/validation";
test("validateDataset", () => {
  const g = { slug: "wine", name: "Wine", description: "d", task: "Phân loại", rows: 178, features: 13, url: "https://scikit-learn.org/x", license: "BSD-3", loadCode: "print(1)", baseline: "KNN" };
  assert.equal(validateDataset(g).ok, true);
  assert.equal(validateDataset({ ...g, slug: "Wine X" }).ok, false); assert.equal(validateDataset({ ...g, rows: -1 }).ok, false);
  assert.equal(validateDataset({ ...g, rows: "178" }).ok, false); assert.equal(validateDataset({ ...g, url: "ftp://x" }).ok, false);
  assert.equal(validateDataset(undefined).ok, false);
});
import { validateModule, validateLesson, validateQuestion } from "../src/lib/validation";
test("validateModule/Lesson/Question", () => {
  assert.equal(validateModule({ courseId: "c1", title: "M" }).ok, true); assert.equal(validateModule({ courseId: "", title: "M" }).ok, false);
  const l = { moduleId: "m", slug: "bai-moi", title: "T", level: "Beginner", minutes: 30, contentFile: "bai-moi.md" };
  assert.equal(validateLesson(l).ok, true); assert.equal(validateLesson({ ...l, contentFile: "" }).ok, true);
  for (const bad of [{ contentFile: "../../etc/passwd" }, { contentFile: "a/b.md" }, { contentFile: "x.txt" }, { slug: "Bad Slug" }, { level: "Expert" }, { minutes: 0 }, { minutes: 2.5 }]) assert.equal(validateLesson({ ...l, ...bad }).ok, false);
  const q = { lessonId: "l", prompt: "?", options: ["a", "b"], correct: 1, explanation: "vì" };
  assert.equal(validateQuestion(q).ok, true);
  for (const bad of [{ correct: 2 }, { correct: -1 }, { options: ["a"] }, { options: ["a", "a"] }, { options: ["a", ""] }, { options: "ab" }, { explanation: "" }]) assert.equal(validateQuestion({ ...q, ...bad }).ok, false);
});
import { searchDocs, shuffleIdx, slugifyHeading } from "../src/lib/search"; import { validateStudyPing } from "../src/lib/validation";
test("tìm kiếm không phân biệt dấu, AND các từ, xếp hạng theo tiêu đề", () => {
  const docs = [{ slug: "a", title: "Đạo hàm và gradient", text: "Gradient chỉ hướng tăng nhanh nhất." }, { slug: "b", title: "KNN", text: "Khoảng cách Euclid; không liên quan." }, { slug: "c", title: "Xác suất", text: "Có nhắc tới đạo hàm của log-likelihood." }];
  assert.deepEqual(searchDocs(docs, "dao ham").map(h => h.slug), ["a", "c"]); assert.deepEqual(searchDocs(docs, "dao ham gradient").map(h => h.slug), ["a"]);
  assert.deepEqual(searchDocs(docs, "x"), []); assert.deepEqual(searchDocs(docs, "khongcoo"), []);
});
test("shuffleIdx là hoán vị, tất định theo seed", () => {
  const a = shuffleIdx(6, 42); assert.deepEqual([...a].sort(), [0, 1, 2, 3, 4, 5]); assert.deepEqual(a, shuffleIdx(6, 42)); assert.notDeepEqual(shuffleIdx(6, 1), shuffleIdx(6, 2));
});
test("slugifyHeading và validateStudyPing", () => {
  assert.equal(slugifyHeading("Công thức và ý tưởng"), "cong-thuc-va-y-tuong"); assert.equal(slugifyHeading("Đạo hàm"), "dao-ham");
  assert.equal(validateStudyPing({ lessonId: "x", seconds: 30 }).ok, true); for (const b of [0, 121, 1.5, "30", null]) assert.equal(validateStudyPing({ lessonId: "x", seconds: b }).ok, false);
});
import { RateLimiter } from "../src/lib/rateLimit"; import { isSameOrigin } from "../src/lib/origin"; import { getLessons, getSearchDocs, getStats } from "../src/lib/content";
test("RateLimiter giới hạn theo cửa sổ thời gian", () => {
  const r = new RateLimiter(3, 1000); for (let i = 0; i < 3; i++) assert.equal(r.check("k", 0).ok, true);
  const x = r.check("k", 10); assert.equal(x.ok, false); assert.equal(x.retryAfter, 1); assert.equal(r.check("khác", 10).ok, true); assert.equal(r.check("k", 1001).ok, true);
});
test("isSameOrigin chặn nguồn lạ", () => {
  assert.equal(isSameOrigin(null, "localhost:3000"), true); assert.equal(isSameOrigin("http://localhost:3000", "localhost:3000"), true);
  assert.equal(isSameOrigin("http://evil.com", "localhost:3000"), false); assert.equal(isSameOrigin("không phải url", "h"), false); assert.equal(isSameOrigin("http://x", null), false);
});
test("content loader đọc catalog thật (chạy từ thư mục gốc dự án)", () => {
  const s = getStats(); assert.ok(getLessons().length >= 49); assert.equal(s.lessons, getLessons().length); assert.ok(s.images >= 45); assert.equal(getSearchDocs().length, s.lessons);
  assert.ok(searchDocs(getSearchDocs(), "gradient").length > 0);
});
import { reorder } from "../src/lib/order"; import { validatePasswordChange, validateMove } from "../src/lib/validation";
test("reorder và validateMove", () => {
  assert.deepEqual(reorder(["a", "b", "c"], "b", "up"), ["b", "a", "c"]); assert.deepEqual(reorder(["a", "b", "c"], "b", "down"), ["a", "c", "b"]);
  assert.equal(reorder(["a", "b"], "a", "up"), null); assert.equal(reorder(["a", "b"], "b", "down"), null); assert.equal(reorder(["a"], "x", "up"), null);
  assert.equal(validateMove({ kind: "lesson", id: "x", dir: "up" }).ok, true); for (const b of [{ kind: "course" }, { dir: "left" }, { id: "" }, { id: 5 }]) assert.equal(validateMove({ kind: "lesson", id: "x", dir: "up", ...b }).ok, false);
});
test("validatePasswordChange", () => {
  assert.equal(validatePasswordChange({ current: "oldpass1", next: "newpass123" }).ok, true);
  for (const b of [{ next: "short" }, { next: "oldpass1" }, { current: "" }, { next: "x".repeat(101) }]) assert.equal(validatePasswordChange({ current: "oldpass1", next: "newpass123", ...b }).ok, false);
  assert.equal(validatePasswordChange(null).ok, false);
});
import { validateEmailOnly, validateReset, validateContentFile } from "../src/lib/validation"; import { hashToken, isUsable, newToken } from "../src/lib/resetToken"; import { clearContentCache } from "../src/lib/content";
test("token đặt lại mật khẩu: sinh, băm, hết hạn, dùng một lần", () => {
  const t = newToken(), t2 = newToken(); assert.match(t, /^[a-f0-9]{64}$/); assert.notEqual(t, t2); assert.equal(hashToken(t), hashToken(t)); assert.match(hashToken(t), /^[a-f0-9]{64}$/); assert.notEqual(hashToken(t), t);
  const now = new Date("2026-01-01T00:00:00Z"), ok = { expiresAt: new Date("2026-01-01T00:30:00Z"), usedAt: null };
  assert.equal(isUsable(ok, now), true); assert.equal(isUsable({ ...ok, usedAt: now }, now), false); assert.equal(isUsable({ ...ok, expiresAt: new Date("2025-12-31T23:00:00Z") }, now), false); assert.equal(isUsable(null, now), false);
});
test("validateEmailOnly / validateReset / validateContentFile", () => {
  assert.equal(validateEmailOnly({ email: "a@b.vn" }).ok, true); for (const e of ["", "abc", "a@b", " @x.y", 5]) assert.equal(validateEmailOnly({ email: e }).ok, false);
  const tok = "a".repeat(64); assert.equal(validateReset({ token: tok, next: "matkhau123" }).ok, true);
  for (const b of [{ token: "xyz" }, { token: "A".repeat(64) }, { next: "short" }]) assert.equal(validateReset({ token: tok, next: "matkhau123", ...b }).ok, false);
  assert.equal(validateContentFile("bai-moi.md").ok, true); for (const f of ["../x.md", "a/b.md", "x.txt", "Bai.md", ".md", "a.md.exe", null, "-a.md"]) assert.equal(validateContentFile(f).ok, false);
  clearContentCache(); assert.ok(searchDocs(getSearchDocs(), "softmax").length > 0);
});
