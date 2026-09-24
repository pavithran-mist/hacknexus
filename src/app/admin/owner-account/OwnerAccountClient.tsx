"use client";

import { useState } from "react";
import {
  CreditCard,
  QrCode,
  Building,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Save,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface OwnerAccountProps {
  initialAccount: Record<string, string>;
}

export default function OwnerAccountClient({ initialAccount }: OwnerAccountProps) {
  const [formData, setFormData] = useState(initialAccount);
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedField, setCopiedField] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/owner-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update owner account details");
      }

      setSuccessMessage("Owner account and payment settings updated successfully! All participant checkouts will now reflect these details.");
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // UPI deep link for preview
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(
    formData.owner_upi_id || "hacknexus@upi"
  )}&pn=${encodeURIComponent(
    formData.owner_account_name || "HackNexus"
  )}&tn=Hackathon%20Registration&cu=INR`;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold mb-3">
            <CreditCard className="w-3.5 h-3.5" /> Financial & Banking Setup
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Owner Account & Payment Details
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your official bank account, UPI ID, and payment gateway keys. These details will be dynamically rendered to teams on the registration payment step and inside their participant dashboard.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Gateway Mode */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                Active Payment Gateway Mode
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {[
                  {
                    id: "DEMO",
                    label: "Demo Payment",
                    desc: "Simulated sandbox for instant zero-friction team testing.",
                  },
                  {
                    id: "DIRECT_UPI",
                    label: "Direct UPI & Bank",
                    desc: "Participants pay your UPI / Bank & enter UTR.",
                  },
                  {
                    id: "RAZORPAY",
                    label: "Razorpay Gateway",
                    desc: "Credit/Debit Cards, NetBanking, and UPI checkout.",
                  },
                ].map((mode) => (
                  <label
                    key={mode.id}
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col justify-between transition-all ${
                      formData.payment_mode === mode.id
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-[#30363D] bg-[#0D1117] text-muted-foreground hover:border-[#4B5563]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-white">{mode.label}</span>
                      <input
                        type="radio"
                        name="payment_mode"
                        value={mode.id}
                        checked={formData.payment_mode === mode.id}
                        onChange={handleChange}
                        className="text-red-600 focus:ring-red-500"
                      />
                    </div>
                    <span className="text-[11px] leading-relaxed">{mode.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Owner Bank Account Info */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-red-500" />
                  Bank & Beneficiary Details
                </h2>
                <span className="text-xs text-muted-foreground">Displayed during checkout</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-white">
                    Beneficiary / Account Holder Name
                  </label>
                  <input
                    type="text"
                    name="owner_account_name"
                    value={formData.owner_account_name || ""}
                    onChange={handleChange}
                    placeholder="e.g. HackNexus Global Foundation"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Official UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    name="owner_upi_id"
                    value={formData.owner_upi_id || ""}
                    onChange={handleChange}
                    placeholder="e.g. hacknexus@upi"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-white text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="owner_bank_name"
                    value={formData.owner_bank_name || ""}
                    onChange={handleChange}
                    placeholder="e.g. HDFC Bank Ltd"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    name="owner_account_number"
                    value={formData.owner_account_number || ""}
                    onChange={handleChange}
                    placeholder="e.g. 50200084729184"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-white text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Bank IFSC Code
                  </label>
                  <input
                    type="text"
                    name="owner_ifsc_code"
                    value={formData.owner_ifsc_code || ""}
                    onChange={handleChange}
                    placeholder="e.g. HDFC0001234"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-white text-xs font-mono uppercase focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Billing Support Email
                  </label>
                  <input
                    type="email"
                    name="owner_contact_email"
                    value={formData.owner_contact_email || ""}
                    onChange={handleChange}
                    placeholder="e.g. billing@hacknexus.io"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Support / WhatsApp Phone
                  </label>
                  <input
                    type="text"
                    name="owner_contact_phone"
                    value={formData.owner_contact_phone || ""}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Razorpay Gateway Keys */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-red-500" />
                  Razorpay API Credentials (Optional)
                </h2>
                <span className="text-xs text-muted-foreground">For Online Cards & NetBanking</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Key ID
                  </label>
                  <input
                    type="text"
                    name="razorpay_key_id"
                    value={formData.razorpay_key_id || ""}
                    onChange={handleChange}
                    placeholder="rzp_live_..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-white text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>Key Secret</span>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[11px] text-muted-foreground hover:text-white flex items-center gap-1"
                    >
                      {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSecret ? "Hide" : "Show"}</span>
                    </button>
                  </label>
                  <input
                    type={showSecret ? "text" : "password"}
                    name="razorpay_key_secret"
                    value={formData.razorpay_key_secret || ""}
                    onChange={handleChange}
                    placeholder="Key Secret"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-white text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save Account & Gateway Settings"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Preview Card: 1 col */}
        <div className="space-y-6">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-6 sticky top-20">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-red-500">
              <Sparkles className="w-4 h-4" /> Live Participant Preview
            </h2>

            {/* Virtual Card */}
            <div className="bg-gradient-to-br from-[#1F242C] to-[#0D1117] border border-red-500/30 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden space-y-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  {formData.owner_bank_name || "HDFC Bank"}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-300">
                  OFFICIAL BENEFICIARY
                </span>
              </div>

              <div className="w-9 h-7 rounded bg-amber-400/80 border border-amber-300 shadow-inner flex items-center justify-center">
                <div className="w-6 h-4 border border-amber-600/60 rounded-sm" />
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Account Number</p>
                <p className="font-mono text-base font-bold tracking-wider text-white">
                  {formData.owner_account_number || "•••• •••• ••••"}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#30363D]">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase">Beneficiary</p>
                  <p className="font-semibold text-white text-[11px] truncate max-w-[130px]">
                    {formData.owner_account_name || "HackNexus Owner"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground uppercase">IFSC Code</p>
                  <p className="font-mono font-bold text-red-400 text-[11px]">
                    {formData.owner_ifsc_code || "IFSC0000000"}
                  </p>
                </div>
              </div>
            </div>

            {/* UPI QR Code Preview */}
            <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-white">
                <QrCode className="w-4 h-4 text-red-500" />
                <span>Direct UPI QR Scanner</span>
              </div>

              <div className="w-36 h-36 mx-auto bg-white rounded-xl p-2.5 shadow-md flex items-center justify-center">
                {/* Visual SVG QR Representation */}
                <div className="w-full h-full bg-slate-900 rounded-lg p-2 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-2 border-white rounded-sm p-0.5"><div className="w-full h-full bg-white" /></div>
                    <div className="w-6 h-6 border-2 border-white rounded-sm p-0.5"><div className="w-full h-full bg-white" /></div>
                  </div>
                  <div className="text-[8px] text-center font-bold text-red-400 uppercase tracking-tighter">
                    SCAN & PAY
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-6 h-6 border-2 border-white rounded-sm p-0.5"><div className="w-full h-full bg-white" /></div>
                    <div className="w-4 h-4 bg-red-500 rounded-sm" />
                  </div>
                </div>
              </div>

              <div className="text-xs">
                <p className="text-muted-foreground text-[11px]">UPI ID:</p>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-white text-xs">
                    {formData.owner_upi_id || "hacknexus@upi"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.owner_upi_id || "hacknexus@upi", "upi")}
                    className="p-1 rounded hover:bg-[#161B22] text-muted-foreground hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                {copiedField === "upi" && (
                  <span className="text-[10px] text-emerald-400">Copied to clipboard!</span>
                )}
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground space-y-1">
              <p className="font-semibold text-white">Security & Audit:</p>
              <p>Every change to owner banking and payment details is cryptographically logged in the immutable Audit Trail with the admin user ID and IP address.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
