import type { PrismaClient } from "@prisma/client";
import { db } from "./db";
import { lessonExists, readLesson } from "./lessonFiles";

// Query publication/admin edits from the DB, not the immutable release catalog.
export async function getPublishedSearchDocs(client: PrismaClient = db) {
  const lessons = await client.lesson.findMany({
    where: { contentFile: { not: null }, module: { course: { published: true } } },
    orderBy: [{ module: { course: { order: "asc" } } }, { module: { order: "asc" } }, { order: "asc" }],
  });
  return lessons.flatMap(l => l.contentFile && lessonExists(l.contentFile)
    ? [{ slug: l.slug, title: l.title, text: readLesson(l.contentFile).replace(/[#*`$\\]|!\[[^\]]*\]\([^)]*\)/g, " ") }]
    : []);
}
