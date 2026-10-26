import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import CodeBlock from "./CodeBlock";
import { slugifyHeading } from "../lib/search";

// One SSR-compatible pipeline for release Markdown and admin-authored content.
// Raw HTML stays disabled. KaTeX emits both visual HTML and accessible MathML.
const remarkPlugins = [remarkMath];
const mathOptions = { output: "htmlAndMathml", trust: false, strict: "error" } as const;
// Quiz fields can contain admin-authored multiline Markdown. Keep their output
// valid inside legend/label/p, while retaining KaTeX's span and MathML elements.
const blocks = ["h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "pre", "hr", "table", "thead", "tbody", "tr", "td", "th", "div", "section", "figure", "figcaption"];
function textOf(node: ReactNode): string {
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node === "string" || typeof node === "number") return String(node);
  return isValidElement<{ children?: ReactNode }>(node) ? textOf(node.props.children) : "";
}

export default function MarkdownContent({ children, inline = false }: { children: string; inline?: boolean }) {
  return <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={[[rehypeKatex, mathOptions]]}
    disallowedElements={inline ? blocks : undefined} unwrapDisallowed={inline} components={{
    p: ({ node, children }) => {
      if (inline) return <span>{children}</span>;
      const child = node?.children.length === 1 ? node.children[0] : null;
      if (child?.type === "element" && child.tagName === "img") {
        return <figure>{children}<figcaption>{String(child.properties.alt ?? "")}</figcaption></figure>;
      }
      return <p className={textOf(children).startsWith("Kết quả kỳ vọng") ? "expected" : undefined}>{children}</p>;
    },
    h2: ({ children }) => <h2 id={slugifyHeading(textOf(children))}>{children}</h2>,
    pre: ({ children }) => {
      const lang = isValidElement<{ className?: string }>(children) ? children.props.className?.match(/language-(\w+)/)?.[1] ?? "" : "";
      return <CodeBlock text={textOf(children).replace(/\n$/, "")} lang={lang} />;
    },
  }}>{children}</ReactMarkdown>;
}
