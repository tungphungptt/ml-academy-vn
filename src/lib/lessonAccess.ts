import { db } from "./db";
/** The same publication boundary used by lesson pages and quiz grading. */
export function publishedLesson(id: string) {
  return db.lesson.findFirst({ where: { id, contentFile: { not: null }, module: { course: { published: true } } }, select: { id: true } });
}
