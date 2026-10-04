const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

async function main() {
  const email = "admin@floracurtains.ae";
  const password = "ChangeThisPassword123!";
  const name = "Flora Admin";

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
      role: "ADMIN",
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: "ADMIN",
    },
  });

  console.log("");
  console.log("================================");
  console.log("ADMIN ACCOUNT READY");
  console.log("================================");
  console.log("Email:", user.email);
  console.log("Role:", user.role);
  console.log("================================");
}

main()
  .catch((error) => {
    console.error("Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
