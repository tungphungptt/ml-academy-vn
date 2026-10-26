import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import HeroArt from "../src/components/HeroArt";

test("React 19 and the patched KaTeX render Markdown/math and reject trusted HTML commands", () => {
  const render = (text: string) => renderToStaticMarkup(<ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{text}</ReactMarkdown>);
  assert.match(render("# Regression\n\n$x^2 + y^2$"), /class="katex"/);
  assert.match(render("# Regression\n\n$x^2 + y^2$"), /<h1>Regression<\/h1>/);
  assert.doesNotMatch(render("$\\href{javascript:alert(1)}{unsafe}$"), /href="javascript:/);
  assert.match(renderToStaticMarkup(<HeroArt />), /<svg/);
});
