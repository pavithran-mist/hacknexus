import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"]);

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
      razorpay_key_secret: "••••••••••••••••",
    };

    settings.forEach((s) => {
      accountDetails[s.key] = s.value;
    });

    return NextResponse.json({ accountDetails });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load owner account details" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();

    const allowedKeys = [
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

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(body[key]) },
          create: {
            key,
            value: String(body[key]),
            description: `Payment & Owner Config: ${key}`,
          },
        });
      }
    }

    await logActivity({
      actorId: user.id,
      actorEmail: user.email,
      action: "OWNER_ACCOUNT_UPDATED",
      entity: "SystemSetting",
      metadata: {
        updatedBy: user.email,
        keys: Object.keys(body),
      },
    });

    return NextResponse.json({ success: true, message: "Owner account details updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save owner account details" }, { status: 500 });
  }
}
