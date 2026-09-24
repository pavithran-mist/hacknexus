# HACKNEXUS — Real Production Hackathon Management Platform
> **Build. Innovate. Compete.**

HackNexus is a complete, enterprise-grade, multi-hackathon management platform engineered with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM, and SQLite out-of-the-box (with zero-code migration to PostgreSQL/MySQL).

HackNexus is **NOT** a visual prototype or mock landing page. Every statistic, registration record, submission workflow, judging rubric, payment receipt, and audit log is backed by real relational database tables and strict role-based access control (RBAC).

---

## 🌟 Key Highlights & Architectural Features

### 1. Multi-Hackathon Architecture
- Centralized multi-tenant hackathon engine supporting concurrent events with independent timelines, themes, problem statements, registration fees, and judging criteria.
- Dynamic fee configuration: easily adjust fees (e.g. ₹499, ₹799, or custom) per hackathon or via the global admin settings panel.

### 2. Role-Based Access Control (RBAC) & Edge Security
- **Strict Roles**: `SUPER_ADMIN`, `ADMIN`, `JUDGE`, and `PARTICIPANT`.
- **Edge Middleware**: High-performance route protection guarding `/admin/*`, `/judge/*`, and `/dashboard/*`.
- **Cryptographic Security**: Industry-standard password hashing with `bcryptjs` and stateless JWT authentication with `jose` using tamper-proof signing secrets.

### 3. Participant Lifecycle & 8-Step Team Registration
- **Step-by-step registration wizard** with real-time validation:
  1. Team Profile & Leader credentials
  2. Team Members roster (strictly enforces 2 to 4 members with email/college validations)
  3. Hackathon Theme selection
  4. Problem Statement selection
  5. Project Proposal, synopsis, and tech stack specification
  6. Review & Real-time Registration Summary
  7. Payment Gateway Integration: Dual-mode checkout supporting production Razorpay workflows and an interactive, clearly labeled **Demo Payment Mode** ("Demo Payment — No real money is charged").
  8. Instant Confirmation with team ID (`HACK-YYYY-XXXXX`), celebratory confetti, receipt view, and auto-generated user credentials.

### 4. Interactive Participant Dashboard
- **Live Countdown Timer** tracking registration and final submission deadlines down to the second.
- **Prototype Submission System**: Submit and update live prototype URLs, GitHub repositories, and demo videos before the checkpoint deadline with automated URL validation.
- **5-Stage Final Submission Journey**:
  - `SCANNING`: Validating repository structure and files
  - `EXTRACTING`: Parsing metadata and architecture artifacts
  - `VALIDATING`: Checking deliverable requirements and dependencies
  - `MAPPING`: Linking to team track and problem statement
  - `COMPLETED`: Generating official cryptographic Submission ID (`SUB-YYYY-XXXXX`)
  - Features real-time animated stage tracking with speed controls (Normal, Fast, Instant).

### 5. Judge Evaluation Portal
- Dedicated rubric-based scoring interface for appointed judges.
- Evaluates assigned submissions across 5 weighted criteria:
  - Technical Complexity (25 pts)
  - Innovation & Novelty (20 pts)
  - Practical Feasibility (20 pts)
  - UI/UX & Design (15 pts)
  - Presentation & Pitch (20 pts)
- Total normalized score calculation (out of 100), detailed qualitative feedback, and real-time completion status tracking.

### 6. Enterprise Admin Console (Zero Hardcoding)
- **Real-Time Analytics Visualizer**: Powered by Recharts and computed strictly from database records:
  - Team registration trajectory over time
  - Revenue and payment status breakdown
  - Submissions distribution across themes
  - Evaluation leaderboard and judge assignment quotas
- **Team Management**: Inspect team rosters, filter by theme or payment status, verify details, and manage registrations.
- **Payment Operations & Financial Audit Trail**:
  - View all transactions, gateway references, and amounts.
  - Manual payment status override with **mandatory audit rationale** logged to the database.
- **Content & Event Management**:
  - Hackathon creator and editor
  - Track & Theme manager
  - Problem Statement creator with difficulty tags and starter assets
  - Announcement broadcaster with category badges (Important, Urgent, General)
  - Schedule and milestone timeline manager
  - Website CMS for editing hero copy, FAQs, rules, and rules of engagement
- **Database Backup & Migration**:
  - One-click JSON and CSV export compliant with standardized schema structures (excluding sensitive password hashes).
  - Bulk JSON import with transaction-safe rollbacks.
- **System Settings**:
  - Live toggles for registration fees, demo payment modes, maintenance mode, and live activity alerts.
  - Audit log viewer tracking admin, judge, and system actions with timestamps and IP records.

---

## 👥 Seed Credentials (Out of the Box)

The application comes pre-populated with realistic hackathon data:

| Role | Email | Password | Clearances |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@hacknexus.io` | `AdminPassword123!` | Full system access, financial overrides, data export/import, settings |
| **Judge** | `judge@hacknexus.io` | `JudgePassword123!` | Judge Evaluation Portal, rubric scoring, assigned teams |
| **Participant** | `participant@hacknexus.io` | `ParticipantPassword123!` | Participant Dashboard, prototype submission, final submission |

---

## 💻 Tech Stack & Dependencies

- **Framework**: [Next.js 14.2](https://nextjs.org/) (App Router, Server Actions, API Route Handlers)
- **Language**: TypeScript 5 (Strict type checking, zero `any` compile errors)
- **Styling**: Tailwind CSS, PostCSS, Lucide React Icons
- **Database & ORM**: Prisma ORM with SQLite for local zero-config runs (compatible with PostgreSQL/MySQL)
- **Authentication**: JWT via `jose` + `bcryptjs` password hashing
- **Form & Payload Validation**: Zod schema validators
- **Data Visualization**: Recharts (Responsive bar, line, and pie charts)
- **Visual FX**: Canvas Confetti

---

## 🚀 Quickstart Guide

### 1. Installation

Ensure you have **Node.js 18.17+** installed.

```bash
# Clone or navigate to the project directory
cd hacknexus

# Install dependencies
npm install
```

### 2. Database Setup & Seeding

```bash
# Generate Prisma Client and sync schema to database
npx prisma db push

# Seed the database with hackathon, themes, problems, users, and submissions
npm run seed
```

### 3. Run Development Server

```bash
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

- Public Portal: `http://localhost:3000`
- Team Registration: `http://localhost:3000/register-team`
- Participant Login: `http://localhost:3000/login`
- Participant Dashboard: `http://localhost:3000/dashboard`
- Judge Portal: `http://localhost:3000/judge`
- Admin Console: `http://localhost:3000/admin` (or `http://localhost:3000/admin/login`)

---

## 🧪 Testing

A complete automated unit test suite validates all core business logic:
- Team size limits (minimum 2, maximum 4)
- Email and payload schemas via Zod
- Registration fee calculation and INR currency formatting
- Hackathon deadline enforcement logic
- Payment signature and gateway verification logic
- RBAC permission checks
- JSON Export/Import structure sanitization

Run the test suite:

```bash
npm test
```

---

## 📦 Production Build

To compile an optimized production build:

```bash
npm run build
npm start
```

---

## 🗄️ Database Architecture (21 Relational Models)

```mermaid
erDiagram
    User ||--o{ TeamMember : "has"
    User ||--o{ Judge : "has"
    User ||--o{ Notification : "receives"
    User ||--o{ ActivityLog : "triggers"
    Hackathon ||--o{ Theme : "contains"
    Hackathon ||--o{ ProblemStatement : "contains"
    Hackathon ||--o{ Team : "hosts"
    Hackathon ||--o{ Registration : "tracks"
    Hackathon ||--o{ TimelineEvent : "schedules"
    Hackathon ||--o{ EvaluationCriteria : "defines"
    Theme ||--o{ ProblemStatement : "categorizes"
    Theme ||--o{ Team : "selected_by"
    ProblemStatement ||--o{ Team : "chosen_by"
    Team ||--|{ TeamMember : "consists_of"
    Team ||--|| Registration : "has"
    Team ||--o{ Payment : "makes"
    Team ||--o| Prototype : "submits"
    Team ||--o| Submission : "submits"
    Submission ||--o{ JudgeAssignment : "assigned_to"
    Judge ||--o{ JudgeAssignment : "evaluates"
    JudgeAssignment ||--o{ EvaluationScore : "records"
    EvaluationCriteria ||--o{ EvaluationScore : "measures"
```

1. **`User`**: Accounts with hashed passwords, roles (`SUPER_ADMIN`, `ADMIN`, `JUDGE`, `PARTICIPANT`).
2. **`Hackathon`**: Multi-tenant event records with dates, rules, prizes, and fee config.
3. **`Theme`**: Tracks (e.g. AI & ML, Healthcare & MedTech, Web3, FinTech, GreenTech).
4. **`ProblemStatement`**: Specific challenges within themes with starter resources.
5. **`Team`**: Teams with unique codes, leader relations, and college info.
6. **`TeamMember`**: Member records enforcing role and limits (2 to 4 members).
7. **`Registration`**: Event registration linking team, hackathon, and payment state.
8. **`Payment`**: Financial records with amounts, currencies, gateway transaction IDs, and manual audit trails.
9. **`Prototype`**: Early checkpoint submissions with GitHub, live demo, and video links.
10. **`Submission`**: Final projects with submission number, presentation links, and status.
11. **`Judge`**: Judge profiles with bio, organization, and specialization.
12. **`JudgeAssignment`**: Assignment link between judge and team submission.
13. **`EvaluationCriteria`**: Rubric criteria with max scores and weightages.
14. **`EvaluationScore`**: Numerical points and written feedback awarded per criterion.
15. **`Announcement`**: Broadcast announcements with priority badges.
16. **`Notification`**: In-app participant notifications with read state.
17. **`TimelineEvent`**: Timeline milestones with completion state.
18. **`Sponsor`**: Event partners and tier badges (Platinum, Gold, Silver).
19. **`WebsiteContent`**: Dynamic CMS entries for hero banner, rules, and FAQs.
20. **`ActivityLog`**: System and audit trail logs with actor, action, and IP.
21. **`SystemSetting`**: Dynamic key-value configuration for live feature toggling.

---

## 🔒 Security Hardening

- **SQL Injection Prevention**: Prisma ORM executes parameterized queries under the hood, completely immune to SQL injection.
- **Input Sanitization**: All incoming form payloads and JSON bodies are validated using strict Zod schemas.
- **Audit Trails**: Manual financial overrides, judge assignments, and role mutations log the administrative user ID, timestamp, reason, and IP address.
- **Safe Exports**: The database export tool deliberately sanitizes all data to prevent leaking password hashes, JWT secrets, or administrative access tokens.

---

## 🚢 Deployment Guidelines

### Deploying to Vercel or Node.js Platforms
1. Set the environment variables:
   ```env
   DATABASE_URL="file:./prisma/dev.db" # Or postgresql://user:password@host:5432/dbname
   JWT_SECRET="generate-a-strong-32-byte-hex-secret"
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   NEXT_PUBLIC_ENABLE_DEMO_PAYMENT="true"
   ```
2. For PostgreSQL deployments (Neon, Supabase, AWS RDS):
   - In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
   - Update `DATABASE_URL` to your PostgreSQL connection string.
   - Run `npx prisma db push` and `npm run seed`.
3. In production, configure the Build Command: `npx prisma generate && next build`.

---

## 📄 License

This project was built for the **HACKNEXUS** platform under the MIT License.
