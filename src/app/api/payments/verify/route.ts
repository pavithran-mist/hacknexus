import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logActivity } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      registrationId,
      transactionId,
      gateway = "DEMO",
      orderId,
      paymentId,
      signature,
      isDemo = true,
    } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        team: {
          include: {
            leader: true,
            theme: true,
            problem: true,
            members: true,
          },
        },
        hackathon: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration record not found" },
        { status: 404 }
      );
    }

    // Verify Razorpay HMAC SHA256 Signature if live Razorpay gateway is used
    if (gateway === "RAZORPAY" && !isDemo && orderId && paymentId && signature) {
      const dbSecret = await prisma.systemSetting.findUnique({
        where: { key: "owner_razorpay_key_secret" },
      });
      const razorpaySecret = dbSecret?.value || process.env.RAZORPAY_KEY_SECRET || "";

      if (razorpaySecret && !razorpaySecret.includes("demo_mode")) {
        const expectedSignature = crypto
          .createHmac("sha256", razorpaySecret)
          .update(`${orderId}|${paymentId}`)
          .digest("hex");

        if (expectedSignature !== signature) {
          return NextResponse.json(
            { error: "Payment verification failed: Invalid Razorpay cryptographic signature." },
            { status: 400 }
          );
        }
      }
    }

    // Find the associated payment record or create one
    let payment = await prisma.payment.findFirst({
      where: { registrationId: registration.id },
    });

    const verifiedOrderId = orderId || `demo_ord_${Date.now()}`;
    const verifiedPaymentId = paymentId || `demo_pay_${Date.now()}`;
    const verifiedSignature = signature || `demo_sig_verified_${Date.now()}`;

    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          transactionId: transactionId || `TXN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          registrationId: registration.id,
          teamId: registration.teamId,
          amount: registration.feeAmount,
          currency: registration.currency,
          gateway,
          status: "SUCCESS",
          orderId: verifiedOrderId,
          paymentId: verifiedPaymentId,
          signature: verifiedSignature,
          isDemo: Boolean(isDemo),
        },
      });
    } else {
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          gateway,
          orderId: verifiedOrderId,
          paymentId: verifiedPaymentId,
          signature: verifiedSignature,
          isDemo: Boolean(isDemo),
        },
      });
    }

    // Update Registration to CONFIRMED
    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: "CONFIRMED" },
    });

    // Update Team to APPROVED
    await prisma.team.update({
      where: { id: registration.teamId },
      data: { status: "APPROVED" },
    });

    // Create Notification for the Leader
    await prisma.notification.create({
      data: {
        userId: registration.team.leaderId,
        title: "Registration & Payment Confirmed!",
        message: `Your team ${registration.team.name} is successfully registered for ${registration.hackathon.name}. Registration ID: ${registration.registrationNumber}`,
        type: "REGISTRATION",
        link: "/dashboard",
      },
    });

    // Log Activity
    await logActivity({
      actorId: registration.team.leaderId,
      actorEmail: registration.team.leader.email,
      action: "PAYMENT_COMPLETED",
      entity: "Payment",
      entityId: payment.id,
      metadata: {
        amount: payment.amount,
        currency: payment.currency,
        registrationNumber: registration.registrationNumber,
        teamName: registration.team.name,
        isDemo: Boolean(isDemo),
      },
      isDemo: Boolean(isDemo),
    });

    return NextResponse.json({
      success: true,
      message: isDemo
        ? "Demo Payment Confirmed — No real money charged"
        : "Payment verified successfully",
      registrationNumber: registration.registrationNumber,
      transactionId: payment.transactionId,
      amount: payment.amount,
      currency: payment.currency,
      team: registration.team,
      isDemo: Boolean(isDemo),
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
