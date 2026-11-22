export type QueryParams = Record<string, string | string[] | undefined>;

// Repeated query keys are arrays in Next.js. Use the first value consistently,
// matching URLSearchParams.get(), before passing filters to strings or inputs.
export function singleQueryValues(params: QueryParams): Record<string, string> {
  return Object.fromEntries(Object.entries(params).map(([key, value]) => [key, (Array.isArray(value) ? value[0] : value) ?? ""]));
}
