// Reproducible SSR inventory. No database, seed, network, or expected-output rewrite.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownContent from "../src/components/MarkdownContent";
import { getLessons } from "../src/lib/content";

const baseline = "19596bcb59afdb752d71e9b44de9231f630d08bb";
const hash = (text: string) => createHash("sha256").update(text).digest("hex");
function inspect(text: string) {
  const html = renderToStaticMarkup(<MarkdownContent>{text}</MarkdownContent>);
  return { equations: (html.match(/class="katex"/g) ?? []).length,
    display: (html.match(/class="katex-display"/g) ?? []).length,
    mathml: (html.match(/class="katex-mathml"/g) ?? []).length,
    invalid: html.includes("katex-error"), unrendered: html.includes("language-math") };
}
const lessons = getLessons().map(l => {
  const file = `content/lessons/${l.f}`, text = fs.readFileSync(file, "utf8");
  const before = execFileSync("git", ["show", `${baseline}:${file}`], { encoding: "utf8" });
  return { slug: l.s, file, changed: text !== before, sha256: hash(text), before: inspect(before), after: inspect(text) };
});
const issues = lessons.filter(l => l.after.invalid || l.after.unrendered || l.after.mathml !== l.after.equations);
const summary = { lessons: lessons.length, modifiedLessons: lessons.filter(l => l.changed).length,
  equationsBefore: lessons.reduce((n, l) => n+l.before.equations, 0), equationsAfter: lessons.reduce((n, l) => n+l.after.equations, 0),
  displayBefore: lessons.reduce((n, l) => n+l.before.display, 0), displayAfter: lessons.reduce((n, l) => n+l.after.display, 0), issues: issues.length };
const report = { baseline, note: "Structural SSR evidence, not an automated proof of academic correctness. Baseline and current Markdown are both parsed with the current pipeline; before/after counts measure source delimiters.", summary, lessons };
const at = process.argv.indexOf("--report");
if (at >= 0) {
  if (!process.argv[at+1]) throw new Error("--report requires a path");
  fs.writeFileSync(process.argv[at+1], JSON.stringify(report, null, 1)+"\n");
}
console.log(JSON.stringify(summary));
process.exitCode = issues.length ? 1 : 0;
