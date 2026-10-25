export type L = { id: string; slug: string; title: string; hasContent: boolean };
export function courseProgress(lessons: L[], done: Set<string>) {
  const total = lessons.length, completed = lessons.filter(l => done.has(l.id)).length;
  return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
}
export const nextLesson = (lessons: L[], done: Set<string>) => lessons.find(l => l.hasContent && !done.has(l.id)) ?? null;
