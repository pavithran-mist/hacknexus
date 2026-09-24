import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settings = [
    { key: "owner_account_name", value: "HackNexus Global Foundation", description: "Beneficiary / Account Holder Name" },
    { key: "owner_upi_id", value: "hacknexus@upi", description: "Official UPI Virtual Payment Address" },
    { key: "owner_bank_name", value: "HDFC Bank Ltd", description: "Bank Name for Direct NEFT/IMPS" },
    { key: "owner_account_number", value: "50200084729184", description: "Bank Account Number" },
    { key: "owner_ifsc_code", value: "HDFC0001234", description: "Bank IFSC Code" },
    { key: "owner_contact_email", value: "payments@hacknexus.io", description: "Owner Financial Contact Email" },
    { key: "owner_contact_phone", value: "+91 98765 43210", description: "Owner Support & WhatsApp Contact" },
    { key: "results_published", value: "false", description: "Hackathon Results Publication Status" },
    { key: "razorpay_key_id", value: "rzp_test_HACKNEXUS2026", description: "Razorpay Key ID for Online Cards/NetBanking" },
    { key: "razorpay_key_secret", value: "rzp_secret_HACKNEXUS_DEMO", description: "Razorpay Secret Key" },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("✅ Owner account settings seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
