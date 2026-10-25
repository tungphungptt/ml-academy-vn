export type Tok = { t: string; c: "kw" | "str" | "com" | "num" | "" };
const KW = new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(" "));
const RE = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|\b(\d+\.?\d*(?:[eE][+-]?\d+)?)\b|\b([A-Za-z_]\w*)\b/g;
export function tokenize(code: string): Tok[] {
  const out: Tok[] = []; let last = 0;
  for (const m of code.matchAll(RE)) {
    const i = m.index!; if (i > last) out.push({ t: code.slice(last, i), c: "" });
    out.push({ t: m[0], c: m[1] ? "com" : m[2] ? "str" : m[3] ? "num" : KW.has(m[4]) ? "kw" : "" }); last = i + m[0].length;
  }
  if (last < code.length) out.push({ t: code.slice(last), c: "" });
  return out;
}
