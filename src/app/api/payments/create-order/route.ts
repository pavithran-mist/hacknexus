import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationId, amount, currency = "INR" } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    // Check system settings or environment variables for Razorpay credentials
    const dbKey = await prisma.systemSetting.findUnique({
      where: { key: "owner_razorpay_key_id" },
    });
    const dbSecret = await prisma.systemSetting.findUnique({
      where: { key: "owner_razorpay_key_secret" },
    });

    const keyId = dbKey?.value || process.env.RAZORPAY_KEY_ID || "";
    const keySecret = dbSecret?.value || process.env.RAZORPAY_KEY_SECRET || "";

    const hasRealRazorpay =
      Boolean(keyId) &&
      Boolean(keySecret) &&
      !keyId.includes("demo_mode") &&
      !keySecret.includes("demo_mode");

    const finalAmountInPaise = Math.round((amount || 499) * 100);

    // If real Razorpay keys are provided, call Razorpay Orders API
    if (hasRealRazorpay) {
      try {
        const authHeader =
          "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

        const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: finalAmountInPaise,
            currency: currency || "INR",
            receipt: `rcpt_${registrationId.slice(0, 10)}_${Date.now().toString().slice(-4)}`,
            notes: {
              registrationId,
            },
          }),
        });

        if (rzpResponse.ok) {
          const rzpData = await rzpResponse.json();
          return NextResponse.json({
            success: true,
            orderId: rzpData.id,
            amount: rzpData.amount,
            currency: rzpData.currency,
            keyId: keyId,
            isRealGateway: true,
          });
        } else {
          const errData = await rzpResponse.json();
          console.warn("Razorpay API order error, falling back:", errData);
        }
      } catch (rzpErr) {
        console.error("Razorpay network error:", rzpErr);
      }
    }

    // Graceful fallback / Demo order
    const mockOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      amount: finalAmountInPaise,
      currency: currency || "INR",
      keyId: keyId || "rzp_test_placeholder",
      isRealGateway: false,
      message: hasRealRazorpay
        ? "Razorpay order initiated"
        : "Direct UPI & Demo Checkout active",
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment order" },
      { status: 500 }
    );
  }
}
