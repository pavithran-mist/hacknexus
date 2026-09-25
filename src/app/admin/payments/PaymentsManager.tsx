"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldAlert,
  AlertCircle,
  X,
  Download,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function PaymentsManager({ initialPayments }: { initialPayments: any[] }) {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [adjustingPayment, setAdjustingPayment] = useState<any | null>(null);
  const [adjustAction, setAdjustAction] = useState<"REFUND" | "MANUAL_SUCCESS">("MANUAL_SUCCESS");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleQuickApprove = async (p: any) => {
    setApprovingId(p.id);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/payments/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Approval failed");
        return;
      }
      setMessage(`Payment ${p.transactionId} for squad "${p.team?.name}" approved successfully! Registration confirmed.`);
      setPayments((prev) =>
        prev.map((item) =>
          item.id === p.id
            ? { ...item, status: "SUCCESS", registration: { ...item.registration, status: "CONFIRMED" } }
            : item
        )
      );
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleQuickReject = async (p: any) => {
    if (!confirm(`Are you sure you want to reject payment ${p.transactionId} for squad "${p.team?.name}"?`)) {
      return;
    }
    setApprovingId(p.id);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/payments/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Rejection failed");
        return;
      }
      setMessage(`Payment ${p.transactionId} for squad "${p.team?.name}" marked as REJECTED.`);
      setPayments((prev) =>
        prev.map((item) =>
          item.id === p.id
            ? { ...item, status: "FAILED", registration: { ...item.registration, status: "REJECTED" } }
            : item
        )
      );
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setApprovingId(null);
    }
  };

  const openAdjustModal = (p: any, action: "REFUND" | "MANUAL_SUCCESS") => {
    setAdjustingPayment(p);
    setAdjustAction(action);
    setReason("");
    setError("");
  };

  const handleExecuteAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingPayment) return;
    if (!reason || reason.trim().length < 5) {
      setError("Please provide a detailed audit rationale (at least 5 characters).");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/admin/payments/${adjustingPayment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: adjustAction, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Adjustment failed");
        setSubmitting(false);
        return;
      }

      setMessage(
        adjustAction === "MANUAL_SUCCESS"
          ? `Payment ${adjustingPayment.transactionId} manually confirmed and logged to audit trail.`
          : `Refund initiated for transaction ${adjustingPayment.transactionId}.`
      );

      setAdjustingPayment(null);
      router.refresh();

      // Refresh payments list
      const updated = await fetch("/api/admin/payments").then((r) => r.json());
      if (updated.payments) setPayments(updated.payments);
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const s = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      p.transactionId.toLowerCase().includes(s) ||
      (p.paymentId && p.paymentId.toLowerCase().includes(s)) ||
      p.team?.name?.toLowerCase().includes(s) ||
      p.registration?.registrationNumber?.toLowerCase().includes(s);
    const matchesStatus = filterStatus === "" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage("")} className="text-muted-foreground hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-muted-foreground hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search TXN, UTR, Reg ID, Team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#111827] border border-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING (Action Required)</option>
            <option value="FAILED">FAILED / REJECTED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>

        <a
          href="/api/admin/export?format=csv"
          className="w-full sm:w-auto justify-center px-3.5 py-1.5 rounded-lg bg-[#111827] border border-border text-white text-xs font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-primary" /> Export CSV
        </a>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Transaction ID</th>
                <th className="p-3.5">Registration ID</th>
                <th className="p-3.5">Squad</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Gateway</th>
                <th className="p-3.5">UTR / Reference</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-mono text-white font-bold">{p.transactionId}</td>
                  <td className="p-3.5 font-mono text-teal-400">
                    {p.registration?.registrationNumber || "—"}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{p.team?.name}</span>
                    <span className="text-[11px] text-muted-foreground">{p.team?.leader?.email}</span>
                  </td>
                  <td className="p-3.5 font-mono text-white font-bold">
                    {formatCurrency(p.amount, p.currency)}
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-[10px] text-muted-foreground bg-[#111827] px-2 py-0.5 rounded border border-border">
                      {p.gateway} {p.isDemo && "(DEMO)"}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-xs">
                    {p.paymentId ? (
                      <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 inline-block">
                        {p.paymentId}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">—</span>
                    )}
                  </td>
                  <td className="p-3.5 text-muted-foreground font-mono text-[11px]">
                    {formatDateTime(p.createdAt)}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        p.status === "SUCCESS"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : p.status === "REFUNDED"
                          ? "bg-danger/20 text-rose-400 border border-danger/30"
                          : p.status === "FAILED"
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    {p.status === "PENDING" && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickApprove(p)}
                          disabled={approvingId === p.id}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                          title="1-Click Approve Payment & Confirm Registration"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{approvingId === p.id ? "Approving..." : "Approve"}</span>
                        </button>
                        <button
                          onClick={() => handleQuickReject(p)}
                          disabled={approvingId === p.id}
                          className="px-2 py-1 rounded-md bg-danger/20 text-rose-400 hover:bg-danger hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Reject Payment"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => openAdjustModal(p, "MANUAL_SUCCESS")}
                          className="px-2 py-1 rounded bg-[#111827] text-muted-foreground hover:text-white border border-border text-[10px] transition-colors cursor-pointer"
                          title="Add Audit Justification"
                        >
                          Audit
                        </button>
                      </div>
                    )}
                    {p.status === "SUCCESS" && (
                      <button
                        onClick={() => openAdjustModal(p, "REFUND")}
                        className="px-2.5 py-1 rounded bg-danger/20 text-rose-400 hover:bg-danger hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Issue Refund"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Adjustment & Refund Modal with mandatory audit justification */}
      {adjustingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                {adjustAction === "MANUAL_SUCCESS"
                  ? "Manual Payment Confirmation"
                  : "Issue Payment Refund"}
              </h3>
              <button onClick={() => setAdjustingPayment(null)} className="text-muted-foreground hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#111827] border border-border space-y-1 text-xs">
              <p><strong className="text-white">Transaction:</strong> {adjustingPayment.transactionId}</p>
              <p><strong className="text-white">Squad:</strong> {adjustingPayment.team?.name}</p>
              <p><strong className="text-white">Amount:</strong> {formatCurrency(adjustingPayment.amount, adjustingPayment.currency)}</p>
            </div>

            <form onSubmit={handleExecuteAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="text-teal-400 block mb-1 font-bold">
                  Mandatory Audit Rationale *
                </label>
                <p className="text-[11px] text-muted-foreground mb-1.5">
                  Production security policy requires an immutable audit justification logged with your administrator identity.
                </p>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Offline bank transfer receipt verified by Finance Desk (Ref #BT-9021)"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAdjustingPayment(null)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-white text-xs font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-lg text-white text-xs font-bold transition-all text-center disabled:opacity-50 ${
                    adjustAction === "MANUAL_SUCCESS"
                      ? "bg-primary hover:bg-primary-hover"
                      : "bg-danger hover:bg-rose-500"
                  }`}
                >
                  {submitting ? "Processing..." : "Confirm & Record in Audit Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
