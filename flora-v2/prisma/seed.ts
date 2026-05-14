import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  await (db as any).user.upsert({
    where:  { email: "admin@flora.ae" },
    update: {},
    create: {
      email:    "admin@flora.ae",
      password: await bcrypt.hash("flora2025!", 10),
      name:     "Admin",
      role:     "ADMIN",
    },
  });
  console.log("✅ Seed complete — login: admin@flora.ae / flora2025!");
}

main().catch(console.error).finally(() => db.$disconnect());