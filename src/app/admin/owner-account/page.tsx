import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OwnerAccountClient from "./OwnerAccountClient";

export const dynamic = "force-dynamic";

export default async function OwnerAccountPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login");
  }

  const keys = [
    "owner_account_name",
    "owner_upi_id",
    "owner_bank_name",
    "owner_account_number",
    "owner_ifsc_code",
    "owner_contact_email",
    "owner_contact_phone",
    "owner_qr_code_url",
    "payment_mode",
    "razorpay_key_id",
    "razorpay_key_secret",
  ];

  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: keys } },
  });

  const accountDetails: Record<string, string> = {
    owner_account_name: "HackNexus Global Foundation",
    owner_upi_id: "hacknexus@upi",
    owner_bank_name: "HDFC Bank Ltd",
    owner_account_number: "50200084729184",
    owner_ifsc_code: "HDFC0001234",
    owner_contact_email: "payments@hacknexus.io",
    owner_contact_phone: "+91 98765 43210",
    owner_qr_code_url: "",
    payment_mode: "DEMO",
    razorpay_key_id: "rzp_test_HACKNEXUS2026",
    razorpay_key_secret: "mock_secret_key",
  };

  settings.forEach((s) => {
    accountDetails[s.key] = s.value;
  });

  return <OwnerAccountClient initialAccount={accountDetails} />;
}
