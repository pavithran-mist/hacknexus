"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Layers,
  FileCode,
  Globe,
  CreditCard,
  Download,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Sparkles,
  ExternalLink,
  Building,
  QrCode,
  Copy,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface HackathonData {
  id: string;
  name: string;
  slug: string;
  registrationFee: number;
  currency: string;
  minTeamSize: number;
  maxTeamSize: number;
  status: string;
  themes: Array<{ id: string; name: string; description: string; icon?: string | null }>;
  problems: Array<{
    id: string;
    themeId: string;
    problemCode: string;
    title: string;
    description: string;
    difficulty: string;
    technologies: string;
  }>;
}

interface TeamMember {
  name: string;
  email: string;
  phone?: string;
  college: string;
  department: string;
  role: "DEVELOPER" | "DESIGNER" | "AIML" | "RESEARCHER" | "OTHER";
  isLeader: boolean;
}

function RegisterTeamForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProblemId = searchParams.get("problemId") || "";
  const preselectedThemeId = searchParams.get("themeId") || "";
  const hackathonSlug = searchParams.get("hackathon") || "national-innovation-hackathon-2026";

  const [step, setStep] = useState(1);
  const [hackathon, setHackathon] = useState<HackathonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Team Information
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");

  // Step 2: Team Members
  const [members, setMembers] = useState<TeamMember[]>([
    {
      name: "",
      email: "",
      college: "",
      department: "",
      role: "DEVELOPER",
      isLeader: false,
    },
  ]);

  // Step 3 & 4: Theme & Problem
  const [selectedThemeId, setSelectedThemeId] = useState(preselectedThemeId);
  const [selectedProblemId, setSelectedProblemId] = useState(preselectedProblemId);

  // Step 6: Payment & Confirmed Data
  const [paymentMode, setPaymentMode] = useState<"DEMO" | "DIRECT_UPI" | "RAZORPAY">("DIRECT_UPI");
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [ownerAccount, setOwnerAccount] = useState<Record<string, string>>({
    owner_account_name: "HackNexus Global Foundation",
    owner_upi_id: "hacknexus@upi",
    owner_bank_name: "HDFC Bank Ltd",
    owner_account_number: "50200084729184",
    owner_ifsc_code: "HDFC0001234",
    owner_contact_phone: "+91 98765 43210",
  });

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const [registrationResult, setRegistrationResult] = useState<{
    registrationId: string;
    registrationNumber: string;
    transactionId: string;
    amount: number;
    currency: string;
  } | null>(null);

  // Load active hackathon data and owner account from database
  useEffect(() => {
    async function loadData() {
      try {
        const [res, ownerRes] = await Promise.all([
          fetch(`/api/hackathons/${hackathonSlug}`),
          fetch("/api/owner-account"),
        ]);
        if (res.ok) {
          const data = await res.json();
          setHackathon(data.hackathon);
          if (data.hackathon.themes?.length > 0 && !selectedThemeId) {
            setSelectedThemeId(data.hackathon.themes[0].id);
          }
          if (data.hackathon.problems?.length > 0 && !selectedProblemId) {
            setSelectedProblemId(data.hackathon.problems[0].id);
          }
        }
        if (ownerRes.ok) {
          const ownerData = await ownerRes.json();
          if (ownerData.account) {
            setOwnerAccount(ownerData.account);
          }
        }
      } catch (err) {
        console.error("Failed to load hackathon data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [hackathonSlug]);

  // Autofill leader as member 0 when leader info changes
  useEffect(() => {
    if (leaderName && leaderEmail) {
      setMembers((prev) => {
        const otherMembers = prev.filter((m) => !m.isLeader);
        const leaderMember: TeamMember = {
          name: leaderName,
          email: leaderEmail,
          phone: leaderPhone,
          college: college || "Institution",
          department: department || "Engineering",
          role: "DEVELOPER",
          isLeader: true,
        };
        return [leaderMember, ...otherMembers];
      });
    }
  }, [leaderName, leaderEmail, leaderPhone, college, department]);

  const addMember = () => {
    if (hackathon && members.length >= hackathon.maxTeamSize) {
      setError(`Maximum team size is ${hackathon.maxTeamSize} members.`);
      return;
    }
    setError("");
    setMembers([
      ...members,
      {
        name: "",
        email: "",
        college: college,
        department: department,
        role: "DEVELOPER",
        isLeader: false,
      },
    ]);
  };

  const removeMember = (index: number) => {
    if (members[index].isLeader) {
      setError("Cannot remove the team leader.");
      return;
    }
    setError("");
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof TeamMember, val: any) => {
    setMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // STEP VALIDATIONS
  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!teamName || !leaderName || !leaderEmail || !leaderPhone || !college || !city || !state) {
        setError("Please fill out all required team information fields.");
        return;
      }
      // Synchronize leader into members[0] and set default college
      setMembers((prev) => {
        const otherMembers = prev.filter((m) => !m.isLeader);
        const leaderMember: TeamMember = {
          name: leaderName,
          email: leaderEmail,
          phone: leaderPhone,
          college: college || "Institution",
          department: department || "General",
          role: prev[0]?.role || "DEVELOPER",
          isLeader: true,
        };
        const updatedOthers = otherMembers.map((m) => ({
          ...m,
          college: m.college?.trim() || college || "Institution",
          department: m.department?.trim() || department || "General",
        }));
        return [leaderMember, ...updatedOthers];
      });
      setStep(2);
    } else if (step === 2) {
      if (!hackathon) return;
      if (members.length < hackathon.minTeamSize) {
        setError(`A minimum of ${hackathon.minTeamSize} team members is required. Please click "Add Member" to add ${hackathon.minTeamSize - members.length} more member(s).`);
        return;
      }
      if (members.length > hackathon.maxTeamSize) {
        setError(`A maximum of ${hackathon.maxTeamSize} team members is permitted.`);
        return;
      }
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (!m.name || !m.name.trim()) {
          setError(`Please enter the Full Name for Member ${i + 1}.`);
          return;
        }
        if (!m.email || !m.email.trim() || !m.email.includes("@")) {
          setError(`Please enter a valid Email Address for Member ${i + 1}.`);
          return;
        }
      }
      // Ensure all members inherit college and department if left blank
      setMembers((prev) =>
        prev.map((m) => ({
          ...m,
          college: m.college?.trim() || college || "Institution",
          department: m.department?.trim() || department || "General",
        }))
      );
      setStep(3);
    } else if (step === 3) {
      if (!selectedThemeId) {
        setError("Please choose a competition theme.");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!selectedProblemId) {
        setError("Please choose a problem statement.");
        return;
      }
      setStep(5);
    } else if (step === 5) {
      // Step 5 is Review Summary -> Proceed to Payment Initiation
      handleInitiateRegistration();
    }
  };

  // Step 5 -> 6: Initiate Registration API
  const handleInitiateRegistration = async () => {
    if (!hackathon) return;
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        hackathonId: hackathon.id,
        teamName,
        leaderName,
        leaderEmail,
        leaderPhone,
        college,
        department: department || "General",
        city,
        state,
        country: country || "India",
        themeId: selectedThemeId,
        problemId: selectedProblemId,
        members,
        prototypeUrl: "",
        githubUrl: "",
        videoUrl: "",
        projectDescription: "",
        technologies: "",
      };

      const res = await fetch("/api/teams/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration initiation failed.");
        setSubmitting(false);
        return;
      }

      setRegistrationResult({
        registrationId: data.registrationId,
        registrationNumber: data.registrationNumber,
        transactionId: data.transactionId,
        amount: data.amount,
        currency: data.currency,
      });

      setStep(6); // Jump to Payment Step
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Step 6: Complete Payment Verification / Submit UTR
  const handleCompletePayment = async () => {
    if (!registrationResult) return;
    setError("");

    if (paymentMode === "DIRECT_UPI") {
      if (!utrNumber || utrNumber.trim().length < 6) {
        setError("Please enter your 12-digit UTR / UPI Transaction Reference Number after transferring.");
        return;
      }
    }

    setSubmitting(true);

    try {
      if (paymentMode === "RAZORPAY") {
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registrationId: registrationResult.registrationId,
            amount: registrationResult.amount,
            currency: registrationResult.currency,
          }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          setError(orderData.error || "Failed to initialize Razorpay checkout");
          setSubmitting(false);
          return;
        }

        if (orderData.isRealGateway) {
          await loadRazorpayScript();
          if (typeof window === "undefined" || !(window as any).Razorpay) {
            setError("Unable to load Razorpay checkout script. Check your internet connection.");
            setSubmitting(false);
            return;
          }

          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "HACKNEXUS 2026",
            description: "Squad Registration Fee",
            order_id: orderData.orderId,
            prefill: {
              name: leaderName,
              email: leaderEmail,
              contact: leaderPhone,
            },
            theme: {
              color: "#DC2626",
            },
            handler: async function (response: any) {
              try {
                const verifyRes = await fetch("/api/payments/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    registrationId: registrationResult.registrationId,
                    transactionId: registrationResult.transactionId,
                    gateway: "RAZORPAY",
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                    isDemo: false,
                  }),
                });

                const data = await verifyRes.json();
                if (!verifyRes.ok) {
                  setError(data.error || "Payment signature verification failed.");
                  setSubmitting(false);
                  return;
                }

                setIsPendingApproval(false);
                try {
                  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                } catch {}

                setStep(7);
              } catch {
                setError("Network error while verifying payment.");
              } finally {
                setSubmitting(false);
              }
            },
            modal: {
              ondismiss: function () {
                setSubmitting(false);
              },
            },
          };

          const rzpInstance = new (window as any).Razorpay(options);
          rzpInstance.open();
          return;
        }
      }

      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: registrationResult.registrationId,
          transactionId: registrationResult.transactionId,
          gateway: paymentMode,
          paymentId: utrNumber.trim() || (paymentMode === "DEMO" ? `DEMO-PAY-${Date.now()}` : `UPI-DIRECT-${Date.now()}`),
          orderId: `ORD-${registrationResult.registrationNumber}`,
          isDemo: paymentMode === "DEMO",
        }),
      });

      const data = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(data.error || "Payment verification failed.");
        setSubmitting(false);
        return;
      }

      setIsPendingApproval(Boolean(data.pendingApproval));

      if (!data.pendingApproval) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }

      setStep(7); // Step 7: Confirmation / Status
    } catch {
      setError("Payment processing encountered an error.");
    } finally {
      if (paymentMode !== "RAZORPAY") {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading competition registration details...</span>
        </div>
      </div>
    );
  }

  const selectedTheme = hackathon?.themes.find((t) => t.id === selectedThemeId);
  const selectedProblem = hackathon?.problems.find((p) => p.id === selectedProblemId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Step Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{hackathon?.name || "HackNexus Hackathon"}</span>
          <span className="font-mono font-bold text-white">
            Registration Fee: {formatCurrency(hackathon?.registrationFee || 499, hackathon?.currency)}
          </span>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-7 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? "bg-primary shadow-md shadow-primary/40"
                  : s < step
                  ? "bg-teal-700"
                  : "bg-card border border-border"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">
            Step {step} of 7:{" "}
            {step === 1 && "Team Information"}
            {step === 2 && "Team Members"}
            {step === 3 && "Theme Selection"}
            {step === 4 && "Problem Statement"}
            {step === 5 && "Review Summary"}
            {step === 6 && "Payment Verification"}
            {step === 7 && (isPendingApproval ? "Pending Admin Approval" : "Registration Confirmed")}
          </span>
          <span className="text-muted-foreground text-[11px]">
            {step < 7 ? "All fields saved directly to database" : isPendingApproval ? "Awaiting Verification" : "Confirmed"}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Team Information */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Team Information</h2>
            <p className="text-xs text-muted-foreground">
              Provide team identity and primary leader contact details.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Team Name *</label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Team Phoenix"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Team Leader Name *</label>
              <input
                type="text"
                required
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Leader Email Address *</label>
              <input
                type="email"
                required
                value={leaderEmail}
                onChange={(e) => setLeaderEmail(e.target.value)}
                placeholder="aarav@university.edu"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Leader Phone Number *</label>
              <input
                type="tel"
                required
                value={leaderPhone}
                onChange={(e) => setLeaderPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">College / University *</label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="IIT Bombay"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Department *</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Computer Science & Engineering"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Maharashtra"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Country *</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Team Members */}
      {step === 2 && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">Team Members</h2>
              <p className="text-xs text-muted-foreground">
                Team size configuration: {hackathon?.minTeamSize} to {hackathon?.maxTeamSize} members.
              </p>
            </div>
            <button
              type="button"
              onClick={addMember}
              disabled={hackathon ? members.length >= hackathon.maxTeamSize : false}
              className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" /> Add Member ({members.length}/{hackathon?.maxTeamSize})
            </button>
          </div>

          <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] text-[11px] text-slate-300 flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>All members automatically inherit your team&apos;s college (<strong>{college || "your college"}</strong>). You can also specify different colleges if your squad is cross-institutional.</span>
          </div>

          <div className="space-y-4">
            {members.map((member, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#111827] border border-[#30363D] space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    Member {idx + 1} {member.isLeader && "(Team Leader)"}
                  </span>
                  {!member.isLeader && (
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={member.name}
                      onChange={(e) => updateMember(idx, "name", e.target.value)}
                      placeholder="e.g. Member Name"
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={member.email}
                      onChange={(e) => updateMember(idx, "email", e.target.value)}
                      placeholder="member@example.com"
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">College / Institute</label>
                    <input
                      type="text"
                      value={member.college || college}
                      onChange={(e) => updateMember(idx, "college", e.target.value)}
                      placeholder={college || "Institution Name"}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Role in Team</label>
                    <select
                      value={member.role}
                      onChange={(e) => updateMember(idx, "role", e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="DEVELOPER">Developer</option>
                      <option value="DESIGNER">Designer</option>
                      <option value="AIML">AI / ML Engineer</option>
                      <option value="RESEARCHER">Researcher</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Theme Selection */}
      {step === 3 && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Select Competition Theme</h2>
            <p className="text-xs text-muted-foreground">
              Choose the primary domain track your team is building for.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hackathon?.themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setSelectedThemeId(theme.id)}
                className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                  selectedThemeId === theme.id
                    ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                    : "bg-[#111827] border-border hover:border-muted-foreground"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                    selectedThemeId === theme.id
                      ? "bg-primary text-white border-primary"
                      : "border-border text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{theme.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {theme.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Problem Statement */}
      {step === 4 && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Select Problem Statement</h2>
            <p className="text-xs text-muted-foreground">
              Select an official challenge statement mapped to your chosen track.
            </p>
          </div>

          <div className="space-y-4">
            {hackathon?.problems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => setSelectedProblemId(prob.id)}
                className={`p-5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedProblemId === prob.id
                    ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                    : "bg-[#111827] border-border hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-card border border-border px-2 py-0.5 rounded">
                      {prob.problemCode}
                    </span>
                    <h4 className="text-sm font-bold text-white">{prob.title}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      prob.difficulty === "HARD"
                        ? "bg-danger/20 text-rose-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {prob.description}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  Stack: {prob.technologies}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: Review Summary */}
      {step === 5 && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Review Registration Summary</h2>
            <p className="text-xs text-muted-foreground">
              Verify your team roster and track challenge before proceeding to fee payment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#111827] p-4 rounded-xl border border-border space-y-2">
              <span className="text-[11px] uppercase font-bold text-primary block">Team Identity</span>
              <p><strong className="text-white">Team:</strong> {teamName}</p>
              <p><strong className="text-white">Leader:</strong> {leaderName} ({leaderEmail})</p>
              <p><strong className="text-white">Phone:</strong> {leaderPhone}</p>
              <p><strong className="text-white">Institution:</strong> {college}</p>
              <p><strong className="text-white">Department:</strong> {department || "General"}</p>
              <p><strong className="text-white">Location:</strong> {city}, {state}, {country}</p>
            </div>

            <div className="bg-[#111827] p-4 rounded-xl border border-border space-y-2">
              <span className="text-[11px] uppercase font-bold text-blue-400 block">Competition Selection</span>
              <p><strong className="text-white">Track:</strong> {selectedTheme?.name || "General"}</p>
              <p><strong className="text-white">Challenge:</strong> {selectedProblem?.problemCode} - {selectedProblem?.title}</p>
              <p><strong className="text-white">Squad Size:</strong> {members.length} Members</p>
              <p><strong className="text-white">Registration Fee:</strong> {formatCurrency(hackathon?.registrationFee || 499, hackathon?.currency)}</p>
            </div>
          </div>

          <div className="bg-[#111827] p-4 rounded-xl border border-[#30363D] space-y-2 text-xs">
            <span className="text-[11px] uppercase font-bold text-teal-400 flex items-center gap-1.5">
              <span>🚀</span> Deliverables & Final Project Submission
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Prototype URLs, GitHub repositories, and presentation slide decks are <strong className="text-white">not required</strong> during initial team registration. Your squad will build your solution during the hackathon and submit all final deliverables through the <strong className="text-teal-400">Final Submission page</strong> on your dashboard before code freeze.
            </p>
          </div>
        </div>
      )}

      {/* STEP 6: Payment Verification */}
      {step === 6 && registrationResult && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-2">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Registration Fee Payment</h2>
            <p className="text-xs text-muted-foreground">
              Confirm your registration fee of{" "}
              <strong className="text-white font-mono">
                {formatCurrency(registrationResult.amount, registrationResult.currency)}
              </strong>{" "}
              to activate your squad dashboard.
            </p>
          </div>

          <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-5 space-y-3 max-w-lg mx-auto text-xs">
            <div className="flex justify-between py-1 border-b border-[#30363D]">
              <span className="text-muted-foreground">Team Name</span>
              <span className="font-bold text-white">{teamName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#30363D]">
              <span className="text-muted-foreground">Registration ID</span>
              <span className="font-mono text-red-400 font-bold">{registrationResult.registrationNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#30363D]">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-muted-foreground">{registrationResult.transactionId}</span>
            </div>
            <div className="flex justify-between py-1 text-sm font-bold">
              <span className="text-white">Total Amount Due</span>
              <span className="text-red-400 font-mono">
                {formatCurrency(registrationResult.amount, registrationResult.currency)}
              </span>
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div className="max-w-lg mx-auto space-y-4">
            <label className="text-xs text-muted-foreground block font-medium">Select Payment Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMode("DIRECT_UPI")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMode === "DIRECT_UPI"
                    ? "bg-red-600/10 border-red-500 text-white shadow-md shadow-red-600/20"
                    : "bg-[#0D1117] border-[#30363D] text-muted-foreground hover:border-[#4B5563]"
                }`}
              >
                <strong className="block text-white text-xs mb-0.5">UPI / QR Code</strong>
                <span className="text-[10px] text-muted-foreground">Direct Organizer QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode("DEMO")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMode === "DEMO"
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-300"
                    : "bg-[#0D1117] border-[#30363D] text-muted-foreground hover:border-[#4B5563]"
                }`}
              >
                <strong className="block text-white text-xs mb-0.5">Demo Payment</strong>
                <span className="text-[10px] text-muted-foreground">Instant test approval</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode("RAZORPAY")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMode === "RAZORPAY"
                    ? "bg-red-600/10 border-red-500 text-red-400"
                    : "bg-[#0D1117] border-[#30363D] text-muted-foreground hover:border-[#4B5563]"
                }`}
              >
                <strong className="block text-white text-xs mb-0.5">Razorpay Gateway</strong>
                <span className="text-[10px] text-muted-foreground">Cards / NetBanking</span>
              </button>
            </div>

            {/* Direct UPI / Owner Bank Details View */}
            {paymentMode === "DIRECT_UPI" && (
              <div className="p-5 rounded-2xl bg-[#0D1117] border border-[#30363D] space-y-5">
                <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-red-500" />
                    Official Organizer UPI QR & Bank Details
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    VERIFIED ACCOUNT
                  </span>
                </div>

                {/* Organizer Uploaded QR Code Display */}
                <div className="flex flex-col items-center justify-center p-5 bg-[#161B22] rounded-2xl border border-red-500/30 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                    Scan to Pay {formatCurrency(registrationResult.amount, registrationResult.currency)}
                  </span>

                  {ownerAccount.owner_qr_code_image ? (
                    <div className="w-60 h-60 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-2xl border border-white/20">
                      <img
                        src={ownerAccount.owner_qr_code_image}
                        alt="Official Hackathon UPI QR Code"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="w-52 h-52 rounded-2xl bg-white p-4 flex flex-col items-center justify-center shadow-2xl border border-white/20">
                      <QrCode className="w-full h-full text-black" />
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground text-center max-w-sm">
                    Open Google Pay, PhonePe, Paytm, BHIM, or any UPI app, scan the QR code above, and complete your transfer of{" "}
                    <strong className="text-white font-mono">{formatCurrency(registrationResult.amount, registrationResult.currency)}</strong>.
                  </p>
                </div>

                {/* Bank & UPI VPA Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block">Beneficiary Name</span>
                    <span className="font-bold text-white">{ownerAccount.owner_account_name}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block">Bank Name</span>
                    <span className="font-bold text-white">{ownerAccount.owner_bank_name}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{ownerAccount.owner_account_number}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(ownerAccount.owner_account_number, "acc")}
                        className="text-muted-foreground hover:text-white"
                        title="Copy Account Number"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block">IFSC Code</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-red-400">{ownerAccount.owner_ifsc_code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(ownerAccount.owner_ifsc_code, "ifsc")}
                        className="text-muted-foreground hover:text-white"
                        title="Copy IFSC"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* UPI ID with Copy Button */}
                <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Official UPI ID</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-white text-xs">{ownerAccount.owner_upi_id}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(ownerAccount.owner_upi_id, "upi")}
                        className="text-muted-foreground hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {copiedField === "upi" && (
                      <span className="text-[10px] text-emerald-400">UPI ID copied to clipboard!</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-[#0D1117] px-2.5 py-1 rounded border border-[#30363D]">
                    Any UPI App
                  </span>
                </div>

                {/* 12-Digit UTR Input */}
                <div className="space-y-2 pt-3 border-t border-[#30363D]">
                  <label className="text-xs font-bold text-white block">
                    Enter 12-digit UTR / UPI Transaction Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 428910294829 (From PhonePe / GPay / Paytm receipt)"
                    className="w-full bg-[#161B22] border border-red-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold tracking-wider"
                  />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    💡 After transferring ₹{registrationResult.amount}, locate the 12-digit UTR or Reference number on your UPI app transaction receipt and enter it above. The HackNexus organizers will verify your reference in the admin panel and approve your squad.
                  </p>
                </div>
              </div>
            )}

            {paymentMode === "DEMO" && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                <p>⚠️ <strong>DEMO TEST MODE:</strong> No real money is charged. Click below to instantly confirm registration in the database for demonstration and testing purposes.</p>
              </div>
            )}

            {paymentMode === "RAZORPAY" && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-1">
                <p>🔒 <strong>RAZORPAY GATEWAY:</strong> Click below to open secure Razorpay checkout for UPI, Credit/Debit Cards, or NetBanking.</p>
              </div>
            )}
          </div>

          <div className="max-w-lg mx-auto pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={handleCompletePayment}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span>Submitting Transaction...</span>
              ) : (
                <>
                  <span>
                    {paymentMode === "DIRECT_UPI"
                      ? "Submit UTR & Complete Registration"
                      : `Pay ${formatCurrency(registrationResult.amount, registrationResult.currency)} & Confirm Registration`}
                  </span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: Confirmation / Status */}
      {step === 7 && registrationResult && (
        <div className="space-y-6">
          {isPendingApproval ? (
            /* PENDING ADMIN APPROVAL SCREEN (DIRECT_UPI) */
            <div className="bg-card border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-block">
                  Payment Reference Submitted — Pending Admin Verification
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Registration Received for {teamName}!
                </h2>
                <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  Thank you! Your payment reference has been recorded. The HackNexus organizers are reviewing your transaction reference against their bank account. Once approved in the admin panel, your squad registration will be confirmed.
                </p>
              </div>

              {/* Official Registration Receipt Card */}
              <div className="bg-[#111827] border border-border rounded-xl p-6 max-w-lg mx-auto text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">OFFICIAL REGISTRATION ID:</span>
                  <span className="text-base font-bold text-teal-400">{registrationResult.registrationNumber}</span>
                </div>

                <div className="space-y-1.5 text-muted-foreground">
                  <p><strong className="text-white">Squad Name:</strong> {teamName}</p>
                  <p><strong className="text-white">Team Leader:</strong> {leaderName} ({leaderEmail})</p>
                  <p><strong className="text-white">Institution:</strong> {college}</p>
                  <p><strong className="text-white">Track:</strong> {selectedTheme?.name || "General"}</p>
                  <p><strong className="text-white">Challenge:</strong> {selectedProblem?.problemCode}</p>
                  <p><strong className="text-white">Amount:</strong> {formatCurrency(registrationResult.amount, registrationResult.currency)}</p>
                  <p><strong className="text-white">Submitted UTR / Ref:</strong> <span className="text-amber-400 font-bold">{utrNumber}</span></p>
                  <p><strong className="text-white">Approval Status:</strong> <span className="text-amber-400 font-bold">Pending Admin Verification</span></p>
                  <p><strong className="text-white">Prototype Submission:</strong> <span className="text-teal-400">At end of sprint in Final Submission page</span></p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Go to Participant Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-card border border-border text-white hover:bg-muted/40 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Receipt</span>
                </button>
              </div>
            </div>
          ) : (
            /* INSTANTLY CONFIRMED SCREEN (DEMO / RAZORPAY) */
            <div className="bg-card border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
                  Payment & Registration Verified
                </span>
                <h2 className="text-3xl font-extrabold text-white">Welcome to {hackathon?.name}!</h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Your squad <strong className="text-white">{teamName}</strong> has been officially confirmed.
                </p>
              </div>

              {/* Official Registration Receipt Card */}
              <div className="bg-[#111827] border border-border rounded-xl p-6 max-w-lg mx-auto text-left space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">OFFICIAL REGISTRATION ID:</span>
                  <span className="text-base font-bold text-teal-400">{registrationResult.registrationNumber}</span>
                </div>

                <div className="space-y-1.5 text-muted-foreground">
                  <p><strong className="text-white">Team:</strong> {teamName}</p>
                  <p><strong className="text-white">Leader:</strong> {leaderName} ({leaderEmail})</p>
                  <p><strong className="text-white">Institution:</strong> {college}</p>
                  <p><strong className="text-white">Theme:</strong> {selectedTheme?.name}</p>
                  <p><strong className="text-white">Problem:</strong> {selectedProblem?.problemCode}</p>
                  <p><strong className="text-white">Amount Paid:</strong> {formatCurrency(registrationResult.amount, registrationResult.currency)}</p>
                  <p><strong className="text-white">Transaction:</strong> {registrationResult.transactionId}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Go to Participant Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-card border border-border text-white hover:bg-muted/40 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Receipt</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer for Steps 1 - 5 */}
      {step < 6 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg bg-card hover:bg-muted/40 border border-border text-xs text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{step === 5 ? "Proceed to Payment" : "Next Step"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function RegisterTeamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 flex items-center justify-center text-muted-foreground">
          Loading registration portal...
        </div>
      }
    >
      <RegisterTeamForm />
    </Suspense>
  );
}
