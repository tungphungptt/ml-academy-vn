import type { PrismaClient } from "@prisma/client";
import { db } from "./db";
import { lessonExists, readLesson } from "./lessonFiles";
import { getLessons } from "./content";

// Query publication/admin edits from the DB, not the immutable release catalog.
export async function getPublishedSearchDocs(client: PrismaClient = db) {
  const lessons = await client.lesson.findMany({
    where: { contentFile: { not: null }, module: { course: { published: true } } },
    orderBy: [{ module: { course: { order: "asc" } } }, { module: { order: "asc" } }, { order: "asc" }],
    include: { module: { include: { course: true } } },
  });
  const release = new Map(getLessons().map(l => [l.s, l]));
  return lessons.flatMap(l => {
    if (!l.contentFile || !lessonExists(l.contentFile)) return [];
    const meta = release.get(l.slug);
    return [{ slug: l.slug, title: l.title, text: readLesson(l.contentFile).replace(/[#*`$\\]|!\[[^\]]*\]\([^)]*\)/g, " "),
      level: l.level, tier: meta?.tier ?? "", kind: meta?.kind ?? "lesson",
      courseSlug: l.module.course.slug, courseTitle: l.module.course.title }];
  });
}
