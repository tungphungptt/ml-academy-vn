import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownContent from "../src/components/MarkdownContent";
import { SectionHeading } from "../src/components/PageHeading";
test("Vietnamese prose is canonically composed without changing code literals or accents", () => {
  const sample = 'Bắt đầu từ điều bạn tò mò.';
  const nfd = sample.normalize('NFD');
  const heading = renderToStaticMarkup(<SectionHeading title={nfd} />);
  assert.ok(heading.includes(sample));
  const html = renderToStaticMarkup(<MarkdownContent>{`${nfd}\n\n\`${nfd}\``}</MarkdownContent>);
  assert.ok(html.includes(`<p>${sample}</p>`));
  assert.ok(html.includes(`<code>${nfd}</code>`));
});
