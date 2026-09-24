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

    if (action === "MANUAL_SUCCESS") {
      if (!reason || reason.trim().length < 5) {
        return NextResponse.json(
          { error: "A valid audit reason is required for manual payment adjustment" },
          { status: 400 }
        );
      }

      const updated = await prisma.payment.update({
        where: { id: params.id },
        data: {
          status: "SUCCESS",
          manualAdjustmentReason: reason,
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

      // Explicit mandatory audit event
      await logActivity({
        actorId: user.id,
        actorEmail: user.email,
        action: "PAYMENT_MANUALLY_ADJUSTED",
        entity: "Payment",
        entityId: updated.id,
        metadata: {
          transactionId: updated.transactionId,
          amount: updated.amount,
          reason,
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
