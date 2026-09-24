import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.systemSetting.upsert({
    where: { key: "owner_razorpay_key_id" },
    update: { value: "rzp_test_TfvPvr7oVqrINI" },
    create: {
      key: "owner_razorpay_key_id",
      value: "rzp_test_TfvPvr7oVqrINI",
      description: "Razorpay Key ID",
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "owner_razorpay_key_secret" },
    update: { value: "wWA2P4n0PVxNuHvOk9S5zkve" },
    create: {
      key: "owner_razorpay_key_secret",
      value: "wWA2P4n0PVxNuHvOk9S5zkve",
      description: "Razorpay Key Secret",
    },
  });

  console.log("SUCCESS: Razorpay keys synced to database settings!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
