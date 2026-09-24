import { prisma } from "@/lib/prisma";
import PaymentsManager from "./PaymentsManager";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      team: {
        include: { leader: true },
      },
      registration: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Payment & Revenue Audit</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Audit incoming registration payments, refund requests, and perform logged manual adjustments.
        </p>
      </div>

      <PaymentsManager initialPayments={payments} />
    </div>
  );
}
