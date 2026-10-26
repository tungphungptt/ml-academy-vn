// A transparent reading estimate, separate from the catalog's study budget.
// Exercises, code execution and derivations can take substantially longer.
export function readingMinutes(markdown: string) {
  const prose = markdown.replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ");
  return Math.max(1, Math.ceil(prose.trim().split(/\s+/).filter(Boolean).length / 180));
}
