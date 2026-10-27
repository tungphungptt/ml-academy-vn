import { Fragment } from "react";
import { normalizeSearch } from "../lib/search";
// Highlight whole matching words. No HTML injection or offsets into Vietnamese
// combining marks, and never reinterpret a truncated snippet as Markdown/math.
export default function HighlightedText({ text, query }: { text: string; query: string }) {
  const terms = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  return <>{text.split(/(\s+)/).map((word, index) => <Fragment key={index}>{terms.some(term => normalizeSearch(word).includes(term)) ? <mark>{word}</mark> : word}</Fragment>)}</>;
}
