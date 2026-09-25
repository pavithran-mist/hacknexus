import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true, email: true, username: true, role: true, name: true },
  });
  console.log("Current Admins in Neon PostgreSQL Database:");
  console.log(JSON.stringify(admins, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
