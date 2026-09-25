import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "pavithran.mist2008@gmail.com";
  const username = "pavithran@owner1";
  const password = "mist1014@HV";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      username: username.toLowerCase(),
      passwordHash: passwordHash,
      role: "SUPER_ADMIN",
      name: "Pavithran",
    },
    create: {
      name: "Pavithran",
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      passwordHash: passwordHash,
      role: "SUPER_ADMIN",
      phone: "+91 9876543210",
    },
  });

  console.log("SUCCESS: Super Admin account created/updated in Neon PostgreSQL!");
  console.log("ID:", user.id);
  console.log("Name:", user.name);
  console.log("Email:", user.email);
  console.log("Username:", user.username);
  console.log("Role:", user.role);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
