import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logActivity } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { action, reason } = body; // action: 'REFUND' or 'MANUAL_SUCCESS'

    const currentPayment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { registration: true, team: true },
    });

    if (!currentPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (action === "REFUND") {
      const updated = await prisma.payment.update({
        where: { id: params.id },
        data: {
          status: "REFUNDED",
          manualAdjustmentReason: reason || "Admin refund issued",
        },
      });

      await prisma.registration.update({
        where: { id: currentPayment.registrationId },
        data: { status: "CANCELLED" },
      });

      await logActivity({
        actorId: user.id,
        actorEmail: user.email,
        action: "PAYMENT_REFUNDED",
        entity: "Payment",
        entityId: updated.id,
        metadata: {
          transactionId: updated.transactionId,
          amount: updated.amount,
          reason,
        },
      });

      return NextResponse.json({ success: true, payment: updated });
    }

    if (action === "REJECT") {
      const auditReason = reason?.trim() || "Payment rejected by admin - Invalid transaction reference";
      const updated = await prisma.payment.update({
        where: { id: params.id },
        data: {
          status: "FAILED",
          manualAdjustmentReason: auditReason,
        },
      });

      await prisma.registration.update({
        where: { id: currentPayment.registrationId },
        data: { status: "REJECTED" },
      });

      await prisma.team.update({
        where: { id: currentPayment.teamId },
        data: { status: "REJECTED" },
      });

      if (currentPayment.team?.leaderId) {
        await prisma.notification.create({
          data: {
            userId: currentPayment.team.leaderId,
            title: "Payment Verification Notice",
            message: `Your payment reference (${currentPayment.paymentId || currentPayment.transactionId}) could not be verified by the organizers. Reason: ${auditReason}`,
            type: "PAYMENT",
            link: "/dashboard",
          },
        });
      }

      await logActivity({
        actorId: user.id,
        actorEmail: user.email,
        action: "PAYMENT_REJECTED",
        entity: "Payment",
        entityId: updated.id,
        metadata: {
          transactionId: updated.transactionId,
          amount: updated.amount,
          reason: auditReason,
        },
      });

      return NextResponse.json({ success: true, payment: updated });
    }

    if (action === "MANUAL_SUCCESS" || action === "APPROVE") {
      const auditReason =
        reason && reason.trim().length >= 3
          ? reason.trim()
          : currentPayment.paymentId
          ? `Verified UPI Transaction Reference: ${currentPayment.paymentId}`
          : "Verified and confirmed by administrator";

      const updated = await prisma.payment.update({
        where: { id: params.id },
        data: {
          status: "SUCCESS",
          manualAdjustmentReason: auditReason,
        },
      });

      await prisma.registration.update({
        where: { id: currentPayment.registrationId },
        data: { status: "CONFIRMED" },
      });

      await prisma.team.update({
        where: { id: currentPayment.teamId },
        data: { status: "APPROVED" },
      });

      // Send confirmation notification to team leader
      if (currentPayment.team?.leaderId) {
        await prisma.notification.create({
          data: {
            userId: currentPayment.team.leaderId,
            title: "🎉 Registration & Payment Approved!",
            message: `Your payment has been officially verified by the organizers. Your squad ${currentPayment.team.name} is confirmed for HackNexus!`,
            type: "REGISTRATION",
            link: "/dashboard",
          },
        });
      }

      // Explicit mandatory audit event
      await logActivity({
        actorId: user.id,
        actorEmail: user.email,
        action: "PAYMENT_MANUALLY_ADJUSTED",
        entity: "Payment",
        entityId: updated.id,
        metadata: {
          transactionId: updated.transactionId,
          paymentId: currentPayment.paymentId,
          amount: updated.amount,
          reason: auditReason,
          previousStatus: currentPayment.status,
          newStatus: "SUCCESS",
        },
      });

      return NextResponse.json({ success: true, payment: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}
