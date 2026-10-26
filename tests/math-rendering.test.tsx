import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownContent from "../src/components/MarkdownContent";
import QuizForm from "../src/components/QuizForm";

const render = (text: string, inline = false) => renderToStaticMarkup(<MarkdownContent inline={inline}>{text}</MarkdownContent>);

test("SSR emits visual KaTeX plus accessible MathML for Vietnamese inline and display math", () => {
  const html = render(String.raw`Đạo hàm $x_i^2$ và xác suất $P(A\mid B)$.

$$
\begin{aligned}\frac{\partial L}{\partial w}&=\frac2N\sum_{i=1}^N e_ix_i,\\
\mathbb E[X]&=\int_0^1\sqrt{x}\,dx=\frac23.\end{aligned}
$$

$$
f(x)=\begin{cases}x^2&x\ge0\\-x&x<0\end{cases},\quad A=\begin{pmatrix}1&2\\3&4\end{pmatrix},\quad\lVert\nabla L\rVert_2.
$$`);
  assert.ok(html.includes("Đạo hàm"));
  assert.equal((html.match(/class="katex"/g) ?? []).length, 4);
  assert.equal((html.match(/class="katex-display"/g) ?? []).length, 2);
  assert.equal((html.match(/class="katex-mathml"/g) ?? []).length, 4);
  assert.ok(html.includes('class="katex-html" aria-hidden="true"'));
  assert.ok(html.includes("<mfrac>")); assert.ok(html.includes("<mtable"));
  assert.ok(!html.includes("katex-error"));
});

test("math parsing leaves inline and fenced code, dollar signs and braces intact", () => {
  const code = 'price = "$5"\nx_i = {"loss": a_b ** 2}';
  const html = render('`$x_i$`\n\n```python\n' + code + '\n```');
  assert.ok(!html.includes('class="katex"'));
  assert.ok(html.includes('<code>$x_i$</code>'));
  assert.ok(html.includes("$5")); assert.ok(html.includes("x_i"));
  assert.ok(html.includes("Sao chép code"));
});

test("quiz prompts/options and inline explanations use the same renderer before hydration", () => {
  const html = renderToStaticMarkup(<QuizForm quizId="fixture" loggedIn questions={[{
    id: "q", prompt: String.raw`Tính $\sigma(0)$?`, options: ["$0$", "$0.5$"],
  }]} />);
  assert.equal((html.match(/class="katex"/g) ?? []).length, 3);
  assert.ok(!html.includes("<legend><p>"));
  const explanation = render(String.raw`Vì $\sigma(0)=\frac1{1+1}=0.5$.`, true);
  assert.ok(explanation.startsWith("<span>")); assert.ok(explanation.includes("<mfrac>"));
});

test("release lessons, all quiz fields and lab descriptions contain no invalid KaTeX", () => {
  for (const name of fs.readdirSync("content/lessons").filter(n => n.endsWith(".md"))) {
    const source = fs.readFileSync(`content/lessons/${name}`, "utf8");
    const prose = source.replace(/```[\s\S]*?```/g, "");
    assert.doesNotMatch(prose, /\$\$[^$\n]+\$\$/, `${name}: display delimiters must occupy their own lines`);
    const html = render(source);
    assert.ok(!html.includes("katex-error"), name);
    assert.ok(!html.includes('language-math'), `${name}: unrendered math node`);
  }
  for (const name of fs.readdirSync("content/quizzes").filter(n => n.endsWith(".json"))) {
    const qs = JSON.parse(fs.readFileSync(`content/quizzes/${name}`, "utf8"));
    for (const q of qs) for (const text of [q.prompt, ...q.options, q.explanation])
      assert.ok(!render(text, true).includes("katex-error"), `${name}: ${text}`);
  }
  for (const lab of JSON.parse(fs.readFileSync("content/labs.json", "utf8"))) {
    assert.ok(!render(lab.description).includes("katex-error"), lab.id);
    for (const slug of lab.lessonSlugs ?? []) assert.ok(fs.existsSync(`content/lessons/${slug}.md`), slug);
  }
});

test("untrusted HTML, links and KaTeX commands cannot inject executable markup", () => {
  const html = render(String.raw`<script>alert(1)</script>

[x](javascript:alert(1)) $\href{javascript:alert(1)}{x}$ $\htmlClass{evil}{x}$`);
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(!html.includes('class="evil"'));
});

test("standalone lesson figures retain alt text and a caption with valid block nesting", () => {
  const html = render("![Đường hồi quy và sai số](/img/linear-regression.svg)");
  assert.ok(html.includes('<figure>'));
  assert.ok(html.includes('alt="Đường hồi quy và sai số"'));
  assert.ok(html.includes('<figcaption>Đường hồi quy và sai số</figcaption>'));
  assert.ok(!html.includes('<p><figure>'));
});

test("multiline admin quiz fields stay phrasing content inside legend, label and answer paragraphs", () => {
  const html = render("## Tính đạo hàm\n\n- $x_i^2$\n- `a_b = {x: '$5'}`\n\n> Giữ $b$ cố định.\n\n$$\n\\frac{\\partial L}{\\partial b}\n$$", true);
  assert.doesNotMatch(html, /<(?:h[1-6]|p|ul|ol|li|blockquote|pre|div)(?:\s|>)/);
  assert.equal((html.match(/class="katex"/g) ?? []).length, 3);
  assert.ok(html.includes("$5")); assert.ok(html.includes("a_b"));
});
