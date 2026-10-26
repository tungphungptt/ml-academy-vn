import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import { seedDatabase } from "./seed-data";

if (fs.existsSync(".env")) process.loadEnvFile(".env");
const db = new PrismaClient();
seedDatabase(db, { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
  .catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => db.$disconnect());
