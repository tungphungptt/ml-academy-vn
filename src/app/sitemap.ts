import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/metadata";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await db.course.findMany({ where: { published: true }, select: { slug: true, modules: { select: { lessons: { where: { contentFile: { not: null } }, select: { slug: true } } } } } });
  const paths = ["", "/explore", "/courses", "/playground", "/lab", "/projects", "/datasets", "/resources", ...courses.flatMap(c => [`/courses/${c.slug}`, ...c.modules.flatMap(m => m.lessons.map(l => `/learn/${l.slug}`))])];
  return paths.map(path => ({ url: `${SITE_URL}${path}` }));
}
