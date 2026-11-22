type ProseNode = { type: string; value?: string; children?: ProseNode[] };
/** Normalize only Markdown text nodes; code, math, HTML and stored data stay
 * byte-for-byte intact. This is canonical composition, not accent removal. */
export default function normalizeProse() {
  return (tree: ProseNode) => {
    const walk = (node: ProseNode) => {
      if (node.type === "text" && typeof node.value === "string") node.value = node.value.normalize("NFC");
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
