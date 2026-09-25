import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("AdminPassword123!", 10);
  
  const updated = await prisma.user.update({
    where: { email: "admin@hacknexus.io" },
    data: {
      username: "admin",
      passwordHash: hash,
    },
  });

  console.log("Updated admin user with username 'admin':", updated.email, updated.username);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
