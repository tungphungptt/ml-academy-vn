import { importLegacyLessons } from "../src/lib/lessonFiles";

const source = process.argv[2];
if (!source) throw new Error("Usage: npm run content:import -- /absolute/path/to/backed-up/lessons");
console.log(`Imported ${importLegacyLessons(source)} edited/new lessons; no existing overrides replaced.`);
