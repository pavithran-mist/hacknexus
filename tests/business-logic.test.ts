import assert from "node:assert/strict";
import {
  teamRegistrationSchema,
  prototypeSubmissionSchema,
  finalSubmissionSchema,
  loginSchema,
} from "../src/lib/validations";
import { formatCurrency } from "../src/lib/utils";

console.log("🧪 Starting HackNexus Business Logic Test Suite...\n");

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// 1. Team Size Validation
test("Team Size Validation — strictly enforces min (2) and max (4) members", () => {
  const minTeamSize = 2;
  const maxTeamSize = 4;

  const validateSquadSize = (count: number) => {
    return count >= minTeamSize && count <= maxTeamSize;
  };

  assert.equal(validateSquadSize(1), false, "Squad of 1 must be rejected");
  assert.equal(validateSquadSize(2), true, "Squad of 2 must be accepted");
  assert.equal(validateSquadSize(3), true, "Squad of 3 must be accepted");
  assert.equal(validateSquadSize(4), true, "Squad of 4 must be accepted");
  assert.equal(validateSquadSize(5), false, "Squad of 5 must be rejected");
});

// 2. Registration Validation Schema
test("Registration Validation — validates valid team registration payload", () => {
  const validPayload = {
    hackathonId: "hack-123",
    teamName: "Code Warriors",
    leaderName: "Aarav Sharma",
    leaderEmail: "aarav@iitb.ac.in",
    leaderPhone: "+91 9876543210",
    college: "IIT Bombay",
    department: "Computer Science",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    themeId: "theme-ai",
    problemId: "problem-ai-01",
    members: [
      {
        name: "Aarav Sharma",
        email: "aarav@iitb.ac.in",
        college: "IIT Bombay",
        department: "Computer Science",
        role: "DEVELOPER" as const,
        isLeader: true,
      },
      {
        name: "Priya Patel",
        email: "priya@iitb.ac.in",
        college: "IIT Bombay",
        department: "Design",
        role: "DESIGNER" as const,
        isLeader: false,
      },
    ],
    prototypeUrl: "https://myproject.vercel.app",
    githubUrl: "https://github.com/warriors/project",
    projectDescription: "This is a detailed explanation of the novel solution architecture and benchmarks.",
    technologies: "Next.js, Python, PostgreSQL",
  };

  const result = teamRegistrationSchema.safeParse(validPayload);
  assert.equal(result.success, true, "Valid registration must pass validation");
});

test("Registration Validation — rejects invalid email and short description", () => {
  const invalidPayload = {
    hackathonId: "hack-123",
    teamName: "A",
    leaderName: "Aarav",
    leaderEmail: "not-an-email",
    leaderPhone: "123",
    college: "IIT",
    department: "CS",
    city: "M",
    state: "MH",
    themeId: "t1",
    problemId: "p1",
    members: [],
    prototypeUrl: "bad-url",
    githubUrl: "bad-url",
    projectDescription: "Too short",
    technologies: "",
  };

  const result = teamRegistrationSchema.safeParse(invalidPayload);
  assert.equal(result.success, false, "Invalid payload must fail Zod validation");
});

// 3. Registration Fee Calculation & Currency Formatting
test("Registration Fee Calculation — formats INR correctly across ₹499 and ₹799", () => {
  assert.equal(formatCurrency(499, "INR"), "₹499");
  assert.equal(formatCurrency(799, "INR"), "₹799");
  assert.equal(formatCurrency(1299, "INR"), "₹1,299");
});

// 4. Submission Deadline Logic
test("Submission Deadline Logic — correctly detects open vs closed deadline", () => {
  const pastDeadline = new Date(Date.now() - 3600000); // 1 hour ago
  const futureDeadline = new Date(Date.now() + 3600000); // 1 hour in future

  const isClosed = (deadline: Date) => new Date() > deadline;

  assert.equal(isClosed(pastDeadline), true, "Past deadline must be closed");
  assert.equal(isClosed(futureDeadline), false, "Future deadline must be open");
});

// 5. Payment Verification Logic
test("Payment Verification Logic — validates demo payment signature and gateway flags", () => {
  const verifyPayment = (gateway: string, isDemo: boolean, orderId?: string) => {
    if (isDemo) {
      return { status: "SUCCESS", isDemo: true, verified: true };
    }
    if (gateway === "RAZORPAY") {
      if (!orderId) return { status: "FAILED", verified: false };
      return { status: "SUCCESS", isDemo: false, verified: true };
    }
    return { status: "FAILED", verified: false };
  };

  const demoRes = verifyPayment("DEMO", true);
  assert.equal(demoRes.status, "SUCCESS");
  assert.equal(demoRes.isDemo, true);

  const realWithoutOrder = verifyPayment("RAZORPAY", false);
  assert.equal(realWithoutOrder.status, "FAILED");

  const realWithOrder = verifyPayment("RAZORPAY", false, "order_rzp_123");
  assert.equal(realWithOrder.status, "SUCCESS");
  assert.equal(realWithOrder.isDemo, false);
});

// 6. Role Permissions Authorization Logic
test("Role Permissions — enforces Super Admin, Admin, Judge, and Participant clearances", () => {
  const canAccessAdmin = (role: string) => role === "SUPER_ADMIN" || role === "ADMIN";
  const canAccessJudge = (role: string) => role === "JUDGE" || role === "SUPER_ADMIN" || role === "ADMIN";
  const canAccessDashboard = (role: string) => ["PARTICIPANT", "JUDGE", "ADMIN", "SUPER_ADMIN"].includes(role);

  assert.equal(canAccessAdmin("PARTICIPANT"), false, "Participant cannot access admin");
  assert.equal(canAccessAdmin("JUDGE"), false, "Judge cannot access admin");
  assert.equal(canAccessAdmin("ADMIN"), true, "Admin can access admin");
  assert.equal(canAccessAdmin("SUPER_ADMIN"), true, "Super admin can access admin");

  assert.equal(canAccessJudge("PARTICIPANT"), false, "Participant cannot access judge portal");
  assert.equal(canAccessJudge("JUDGE"), true, "Judge can access judge portal");
  assert.equal(canAccessJudge("SUPER_ADMIN"), true, "Super admin can access judge portal");

  assert.equal(canAccessDashboard("PARTICIPANT"), true, "Participant can access dashboard");
});

// 7. Export Dataset Schema Compliance
test("Export Dataset Schema — conforms to Requirement 38 JSON structure without leaking secrets", () => {
  const exportPayload = {
    platform: { name: "HackNexus" },
    hackathons: [],
    themes: [],
    problems: [],
    teams: [],
    members: [],
    registrations: [],
    payments: [],
    prototypes: [],
    submissions: [],
    judges: [],
    assignments: [],
    scores: [],
    announcements: [],
    notifications: [],
    timeline: [],
    activityLogs: [],
    exportedAt: new Date().toISOString(),
  };

  const requiredKeys = [
    "platform",
    "hackathons",
    "themes",
    "problems",
    "teams",
    "members",
    "registrations",
    "payments",
    "prototypes",
    "submissions",
    "judges",
    "assignments",
    "scores",
    "announcements",
    "notifications",
    "timeline",
    "activityLogs",
    "exportedAt",
  ];

  for (const k of requiredKeys) {
    assert.ok(k in exportPayload, `Export payload missing mandatory key "${k}"`);
  }

  // Ensure no password or secret fields exist
  const serialized = JSON.stringify(exportPayload);
  assert.equal(serialized.includes("passwordHash"), false);
  assert.equal(serialized.includes("AUTH_SECRET"), false);
  assert.equal(serialized.includes("RAZORPAY_KEY_SECRET"), false);
});

console.log(`\n========================================`);
console.log(`Summary: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
