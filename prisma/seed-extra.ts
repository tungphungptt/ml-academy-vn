import type { PrismaClient } from "@prisma/client"; import fs from "fs";
const read = (f: string) => JSON.parse(fs.readFileSync(`content/${f}.json`, "utf8"));
export async function seedExtra(db: PrismaClient) {
  for (const d of read("datasets")) await db.dataset.upsert({ where: { slug: d.slug }, update: d, create: d });
  for (const r of read("resources")) await db.resource.upsert({ where: { url: r.url }, update: r, create: r });
  for (const p of read("projects")) { const { steps, ...rest } = p; const data = { ...rest, stepsJson: JSON.stringify(steps) }; await db.project.upsert({ where: { slug: p.slug }, update: data, create: data }); }
}
