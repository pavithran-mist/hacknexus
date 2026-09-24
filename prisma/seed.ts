import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting HackNexus database seeding...");

  // Clean existing data for clean re-seed
  await prisma.evaluationScore.deleteMany({});
  await prisma.judgeAssignment.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.prototype.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.judge.deleteMany({});
  await prisma.evaluationCriteria.deleteMany({});
  await prisma.problemStatement.deleteMany({});
  await prisma.theme.deleteMany({});
  await prisma.timelineEvent.deleteMany({});
  await prisma.sponsor.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.websiteContent.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.hackathon.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Core Users
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);
  const judgePasswordHash = await bcrypt.hash("JudgePassword123!", 10);
  const participantPasswordHash = await bcrypt.hash("ParticipantPassword123!", 10);

  const admin = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@hacknexus.io",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      phone: "+91 9876543210",
    },
  });

  const judgeUser = await prisma.user.create({
    data: {
      name: "Dr. Aris Vance",
      email: "judge@hacknexus.io",
      passwordHash: judgePasswordHash,
      role: "JUDGE",
      phone: "+91 9876543211",
    },
  });

  const participantUser = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "participant@hacknexus.io",
      passwordHash: participantPasswordHash,
      role: "PARTICIPANT",
      phone: "+91 9876543212",
    },
  });

  console.log("✅ Core users created: admin@hacknexus.io, judge@hacknexus.io, participant@hacknexus.io");

  // 2. Create Hackathon
  const now = new Date();
  const hackathon = await prisma.hackathon.create({
    data: {
      name: "National Innovation Hackathon 2026",
      slug: "national-innovation-hackathon-2026",
      tagline: "Turn Your Ideas Into Innovation",
      description:
        "India's premier technology and innovation sprint bringing together 500+ student and professional innovators to build cutting-edge solutions for real-world impact.",
      registrationFee: 499,
      currency: "INR",
      minTeamSize: 2,
      maxTeamSize: 4,
      registrationStartDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      hackathonStartDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      hackathonEndDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
      submissionDeadline: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      status: "REGISTRATION_OPEN",
      contactEmail: "contact@hacknexus.io",
      contactPhone: "+91 80000 12345",
      isFeatured: true,
      socialLinks: JSON.stringify({
        twitter: "https://twitter.com/hacknexus",
        linkedin: "https://linkedin.com/company/hacknexus",
        github: "https://github.com/hacknexus",
        discord: "https://discord.gg/hacknexus",
      }),
    },
  });

  console.log(`✅ Hackathon created: ${hackathon.name} (Fee: ₹${hackathon.registrationFee})`);

  // 3. Create Themes
  const themeData = [
    {
      name: "AI & Machine Learning",
      description: "Develop generative AI, predictive models, autonomous intelligence, and NLP workflows.",
      icon: "Brain",
      order: 1,
    },
    {
      name: "Cybersecurity",
      description: "Build threat intelligence, automated defense, cryptographic verification, and safe infrastructure.",
      icon: "Shield",
      order: 2,
    },
    {
      name: "HealthTech",
      description: "Innovate clinical diagnostic tools, telemedicine, predictive health monitoring, and wellness assistants.",
      icon: "HeartPulse",
      order: 3,
    },
    {
      name: "Agriculture",
      description: "Harness IoT sensors, soil analytics, drone telemetry, and smart supply chain for farmers.",
      icon: "Sprout",
      order: 4,
    },
    {
      name: "Smart Cities",
      description: "Solve urban transit bottlenecks, smart grid distribution, civic issue tracking, and waste management.",
      icon: "Building2",
      order: 5,
    },
  ];

  const themes = [];
  for (const t of themeData) {
    const createdTheme = await prisma.theme.create({
      data: {
        hackathonId: hackathon.id,
        name: t.name,
        description: t.description,
        icon: t.icon,
        order: t.order,
        status: "ACTIVE",
      },
    });
    themes.push(createdTheme);
  }

  console.log(`✅ ${themes.length} Themes created`);

  // 4. Create Problem Statements
  const problems = [
    {
      themeId: themes[0].id,
      problemCode: "HN-AI-001",
      title: "AI-Based Emergency Detection",
      description:
        "Build a real-time multimodal emergency surveillance system using edge video feeds and audio telemetry to identify road accidents, fires, and stampedes within 3 seconds.",
      organization: "National Disaster Response Alliance",
      difficulty: "HARD",
      technologies: "Python, PyTorch, OpenCV, WebSockets, Redis, Next.js",
      requirements:
        "Low-latency detection pipeline (<500ms per frame), false positive suppression algorithm, instant automated SOS alert dispatch to nearest emergency dispatch.",
      expectedOutput:
        "Working prototype with live video stream inference, geospatial alert map, and simulated paramedic dispatch webhook.",
    },
    {
      themeId: themes[1].id,
      problemCode: "HN-CY-001",
      title: "Intelligent Cyber Threat Detection",
      description:
        "Develop an eBPF-powered zero-trust network packet anomaly analyzer capable of intercepting lateral movement and encrypted command-and-control exfiltration in Kubernetes clusters.",
      organization: "Cyber Defense Alliance",
      difficulty: "HARD",
      technologies: "Rust, Go, eBPF, ElasticSearch, Kafka, React",
      requirements:
        "Minimal kernel overhead (<2% CPU), real-time threat visualization graph, automated IP isolation trigger upon malicious heuristic match.",
      expectedOutput:
        "Live containerized test harness demonstrating threat containment upon simulated penetration attack.",
    },
    {
      themeId: themes[2].id,
      problemCode: "HN-HEALTH-001",
      title: "AI Healthcare Assistance Platform",
      description:
        "Create an intelligent triage and clinical record summarization assistant for rural clinics that converts spoken vernacular symptoms into structured ICD-10 medical notes.",
      organization: "Apex Health Network",
      difficulty: "MEDIUM",
      technologies: "Next.js, FastAPI, Whisper AI, LangChain, PostgreSQL",
      requirements:
        "Voice-to-text in at least 3 regional languages, differential diagnosis suggestion for community health workers, offline sync capability.",
      expectedOutput:
        "Progressive Web App with voice consultation flow and auto-generated doctor prescription review card.",
    },
    {
      themeId: themes[3].id,
      problemCode: "HN-AGRI-001",
      title: "Smart Crop & Market Intelligence",
      description:
        "Build a localized crop disease diagnostic and mandi price forecast engine helping smallholder farmers maximize harvest valuation.",
      organization: "AgriTech Innovation Forum",
      difficulty: "MEDIUM",
      technologies: "React, Node.js, TensorFlow Lite, OpenWeather API, IoT",
      requirements:
        "Leaf photograph disease classification with >90% precision, WhatsApp/SMS alert bot, multi-market wholesale price trend prediction.",
      expectedOutput:
        "Mobile-first web dashboard with leaf scanner, price prediction chart, and localized advisory bulletin.",
    },
    {
      themeId: themes[4].id,
      problemCode: "HN-SMART-001",
      title: "Urban Traffic Intelligence",
      description:
        "Design a dynamic traffic signal optimization system that dynamically adjusts green light clearance intervals based on live queue density and ambulance siren prioritization.",
      organization: "Smart City Mission",
      difficulty: "MEDIUM",
      technologies: "Python, YOLOv8, GeoPandas, Redis, Next.js",
      requirements:
        "Traffic congestion index computation per intersection, green-corridor preemptive routing for emergency vehicles.",
      expectedOutput:
        "Interactive intersection simulator showing traffic flow optimization and emergency vehicle corridor clearance.",
    },
  ];

  const createdProblems = [];
  for (const p of problems) {
    const createdProblem = await prisma.problemStatement.create({
      data: {
        hackathonId: hackathon.id,
        themeId: p.themeId,
        problemCode: p.problemCode,
        title: p.title,
        description: p.description,
        organization: p.organization,
        difficulty: p.difficulty,
        technologies: p.technologies,
        requirements: p.requirements,
        expectedOutput: p.expectedOutput,
        status: "ACTIVE",
      },
    });
    createdProblems.push(createdProblem);
  }

  console.log(`✅ ${createdProblems.length} Problem Statements created`);

  // 5. Evaluation Criteria
  const criteriaData = [
    { name: "Innovation & Uniqueness", description: "Originality and novelty of the proposed solution", maxScore: 25 },
    { name: "Technical Implementation", description: "Architecture, code quality, robustness and scalability", maxScore: 25 },
    { name: "Problem Relevance & Impact", description: "Addresses problem statement with measurable real-world impact", maxScore: 20 },
    { name: "Usability & UI/UX", description: "Intuitive user interface, accessibility and user experience", maxScore: 15 },
    { name: "Presentation & Documentation", description: "Clarity of demo, architecture diagrams and repository docs", maxScore: 15 },
  ];

  for (const c of criteriaData) {
    await prisma.evaluationCriteria.create({
      data: {
        hackathonId: hackathon.id,
        name: c.name,
        description: c.description,
        maxScore: c.maxScore,
      },
    });
  }
  console.log("✅ Evaluation Criteria created");

  // 6. Timeline Events
  const timelineData = [
    { title: "Registration Opens", description: "Online team registration and problem statement browsing opens.", date: "Oct 10, 2026", time: "10:00 AM IST", order: 1, status: "COMPLETED" },
    { title: "Problem Statement Selection", description: "Teams finalize their problem statement and submit prototype links.", date: "Oct 25, 2026", time: "11:59 PM IST", order: 2, status: "ACTIVE" },
    { title: "Registration Closes", description: "Final team roster freeze and payment confirmation deadline.", date: "Nov 01, 2026", time: "11:59 PM IST", order: 3, status: "UPCOMING" },
    { title: "Hackathon Begins (Opening Ceremony)", description: "Keynote address, mentor matching, and 48-hour sprint kickoff.", date: "Nov 05, 2026", time: "09:00 AM IST", order: 4, status: "UPCOMING" },
    { title: "Prototype & Checkpoint Review", description: "Mid-way mentor check-in and prototype milestone review.", date: "Nov 06, 2026", time: "02:00 PM IST", order: 5, status: "UPCOMING" },
    { title: "Final Code & Project Submission", description: "Code freeze. Teams submit repository, demo video, and slide deck.", date: "Nov 07, 2026", time: "09:00 AM IST", order: 6, status: "UPCOMING" },
    { title: "Grand Finale Judging", description: "Shortlisted teams pitch live before the industry jury panel.", date: "Nov 07, 2026", time: "02:00 PM IST", order: 7, status: "UPCOMING" },
    { title: "Results & Valedictory Ceremony", description: "Winner announcement, prize distribution, and investor connections.", date: "Nov 07, 2026", time: "06:00 PM IST", order: 8, status: "UPCOMING" },
  ];

  for (const t of timelineData) {
    await prisma.timelineEvent.create({
      data: {
        hackathonId: hackathon.id,
        title: t.title,
        description: t.description,
        date: t.date,
        time: t.time,
        order: t.order,
        status: t.status,
      },
    });
  }
  console.log("✅ Timeline events created");

  // 7. Sponsors
  const sponsorData = [
    { name: "Google Cloud", tier: "TITLE", website: "https://cloud.google.com", order: 1 },
    { name: "GitHub", tier: "PLATINUM", website: "https://github.com", order: 2 },
    { name: "Razorpay", tier: "GOLD", website: "https://razorpay.com", order: 3 },
    { name: "Vercel", tier: "SILVER", website: "https://vercel.com", order: 4 },
  ];

  for (const s of sponsorData) {
    await prisma.sponsor.create({
      data: {
        hackathonId: hackathon.id,
        name: s.name,
        tier: s.tier,
        website: s.website,
        order: s.order,
      },
    });
  }
  console.log("✅ Sponsors created");

  // 8. Website Content
  await prisma.websiteContent.create({
    data: {
      hackathonId: hackathon.id,
      heroTitle: "Turn Your Ideas Into Innovation",
      heroSubtitle:
        "Build bold solutions. Collaborate with brilliant teams. Compete on a platform designed for modern hackathons.",
      aboutText:
        "HackNexus is the high-performance platform powering the next generation of collegiate and enterprise hackathons. From problem statements to automated judging, we streamline the entire lifecycle of competitive innovation.",
      rulesText:
        "1. All team members must be actively enrolled students or professionals.\n2. Projects must be built during the official competition window.\n3. Open-source libraries are permitted; pre-existing closed source solutions are strictly prohibited.\n4. Decisions of the jury panel are final and binding.",
      faqJson: JSON.stringify([
        {
          question: "Who is eligible to participate?",
          answer: "Undergraduate, postgraduate students, and early-career software developers worldwide are eligible.",
          category: "Eligibility",
        },
        {
          question: "What is the team size requirement?",
          answer: "Teams must consist of a minimum of 2 and a maximum of 4 members.",
          category: "Teams",
        },
        {
          question: "How does the registration payment work?",
          answer: "The registration fee is ₹499 per team. Payments can be completed online via UPI, Cards, or NetBanking through our secure payment gateway.",
          category: "Payment",
        },
        {
          question: "Can I submit my prototype link during registration?",
          answer: "Yes, you can provide your initial prototype, GitHub repository, and video URLs during registration and update them up until code freeze.",
          category: "Submission",
        },
      ]),
      contactEmail: "contact@hacknexus.io",
      contactPhone: "+91 80000 12345",
      footerText: "© 2026 HackNexus. All rights reserved. Built for builders.",
      socialLinksJson: JSON.stringify({
        twitter: "https://twitter.com/hacknexus",
        linkedin: "https://linkedin.com/company/hacknexus",
        github: "https://github.com/hacknexus",
      }),
    },
  });
  console.log("✅ Website Content configured");

  // 9. Judge Profile
  const judge = await prisma.judge.create({
    data: {
      userId: judgeUser.id,
      hackathonId: hackathon.id,
      designation: "Principal AI Research Scientist",
      company: "DeepMind",
      expertise: "Multimodal AI, Computer Vision, Distributed Systems",
      bio: "12+ years building deep learning systems in high-impact domains.",
    },
  });
  console.log("✅ Judge profile created");

  // 10. Demo Team: Team Phoenix
  const demoTeam = await prisma.team.create({
    data: {
      hackathonId: hackathon.id,
      name: "Team Phoenix",
      leaderId: participantUser.id,
      themeId: themes[0].id,
      problemId: createdProblems[0].id,
      college: "Indian Institute of Technology Bombay",
      department: "Computer Science & Engineering",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      status: "APPROVED",
    },
  });

  // Team Members
  await prisma.teamMember.createMany({
    data: [
      {
        teamId: demoTeam.id,
        name: "Aarav Sharma",
        email: "participant@hacknexus.io",
        phone: "+91 9876543212",
        college: "IIT Bombay",
        department: "Computer Science",
        role: "DEVELOPER",
        isLeader: true,
      },
      {
        teamId: demoTeam.id,
        name: "Priya Patel",
        email: "priya.patel@demo.edu",
        college: "IIT Bombay",
        department: "Design",
        role: "DESIGNER",
        isLeader: false,
      },
      {
        teamId: demoTeam.id,
        name: "Rohan Gupta",
        email: "rohan.gupta@demo.edu",
        college: "IIT Bombay",
        department: "Electrical Engineering",
        role: "AIML",
        isLeader: false,
      },
    ],
  });

  // Registration Record
  const registration = await prisma.registration.create({
    data: {
      registrationNumber: "HACK-2026-00482",
      hackathonId: hackathon.id,
      teamId: demoTeam.id,
      feeAmount: 499,
      currency: "INR",
      status: "CONFIRMED",
    },
  });

  // Payment Record
  await prisma.payment.create({
    data: {
      transactionId: "TXN-2026-89104",
      registrationId: registration.id,
      teamId: demoTeam.id,
      amount: 499,
      currency: "INR",
      gateway: "DEMO",
      status: "SUCCESS",
      isDemo: true,
      orderId: "order_demo_89104",
      paymentId: "pay_demo_89104",
      signature: "demo_signature_verified",
      metadata: JSON.stringify({ mode: "demo", simulatedAt: new Date().toISOString() }),
    },
  });

  // Prototype Record
  await prisma.prototype.create({
    data: {
      teamId: demoTeam.id,
      prototypeUrl: "https://emergency-ai.vercel.app",
      githubUrl: "https://github.com/team-phoenix/emergency-detector",
      videoUrl: "https://youtube.com/watch?v=demo123",
      projectDescription:
        "Multimodal AI incident detector analyzing live traffic cameras to spot high-impact vehicular collisions and alert local first responders within 3 seconds.",
      technologies: "Next.js, PyTorch, YOLOv8, WebSockets, TailwindCSS",
      status: "APPROVED",
      feedback: "Great prototype and low-latency architecture. Looking forward to final demo.",
    },
  });

  // Final Submission Record
  const submission = await prisma.submission.create({
    data: {
      submissionNumber: "SUB-2026-00182",
      teamId: demoTeam.id,
      hackathonId: hackathon.id,
      projectTitle: "AegisAI — Real-Time Emergency Detection",
      projectDescription:
        "AegisAI processes multiple 1080p surveillance video feeds with sub-300ms inference to classify collisions, fires, and pedestrian incidents with 94.8% accuracy. It sends automated Webhook payloads to police and hospital dispatchers with geolocation, severity score, and video clipping.",
      prototypeUrl: "https://emergency-ai.vercel.app",
      githubUrl: "https://github.com/team-phoenix/emergency-detector",
      demoVideoUrl: "https://youtube.com/watch?v=demo123",
      pptUrl: "https://slides.google.com/presentation/d/demo-aegis-ai",
      documentationUrl: "https://docs.emergency-ai.internal",
      technologies: "PyTorch, FastAPI, Next.js, Redis, WebRTC, Docker",
      expectedImpact: "Reduces golden-hour emergency response times from 14 minutes to under 5 minutes.",
      futureScope: "Integration with drone perimeter surveillance and smart hospital ICU intake queues.",
      status: "SUBMITTED",
    },
  });

  // Assign Judge to Team Phoenix Submission
  await prisma.judgeAssignment.create({
    data: {
      judgeId: judge.id,
      submissionId: submission.id,
      status: "ASSIGNED",
    },
  });

  console.log("✅ Demo Team Phoenix, Registration HACK-2026-00482, Submission SUB-2026-00182 created & assigned to Judge");

  // 11. Announcements
  await prisma.announcement.createMany({
    data: [
      {
        hackathonId: hackathon.id,
        title: "Welcome to National Innovation Hackathon 2026!",
        message:
          "Team registrations are now officially open. Explore the 5 themes and problem statements to assemble your roster.",
        priority: "HIGH",
        targetAudience: "EVERYONE",
      },
      {
        hackathonId: hackathon.id,
        title: "Mentorship Office Hours Released",
        message:
          "Industry mentors from Google Cloud and GitHub will be holding office hours on Discord every Saturday.",
        priority: "NORMAL",
        targetAudience: "PARTICIPANTS",
      },
    ],
  });

  // 12. System Settings
  const settings = [
    { key: "platform_name", value: "HackNexus", description: "Platform Branding Title" },
    { key: "default_currency", value: "INR", description: "Default Currency Symbol" },
    { key: "payment_mode", value: "DEMO", description: "Payment Gateway Mode (DEMO or RAZORPAY)" },
    { key: "demo_mode_enabled", value: "true", description: "Display demo helpers and sample data" },
    { key: "activity_popup_enabled", value: "true", description: "Enable bottom-right live activity feed" },
    { key: "show_demo_activity", value: "true", description: "Display clearly-labeled demo activity in feed" },
  ];

  for (const s of settings) {
    await prisma.systemSetting.create({
      data: s,
    });
  }

  // 13. Initial Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        actorEmail: "admin@hacknexus.io",
        action: "HACKATHON_CREATED",
        entity: "Hackathon",
        entityId: hackathon.id,
        metadata: JSON.stringify({ name: hackathon.name, fee: 499 }),
        isDemo: true,
      },
      {
        actorEmail: "participant@hacknexus.io",
        action: "TEAM_REGISTERED",
        entity: "Team",
        entityId: demoTeam.id,
        metadata: JSON.stringify({ teamName: "Team Phoenix", regId: "HACK-2026-00482" }),
        isDemo: true,
      },
      {
        actorEmail: "participant@hacknexus.io",
        action: "PAYMENT_COMPLETED",
        entity: "Payment",
        entityId: "TXN-2026-89104",
        metadata: JSON.stringify({ amount: 499, mode: "DEMO" }),
        isDemo: true,
      },
      {
        actorEmail: "participant@hacknexus.io",
        action: "PROTOTYPE_SUBMITTED",
        entity: "Prototype",
        entityId: demoTeam.id,
        metadata: JSON.stringify({ url: "https://emergency-ai.vercel.app" }),
        isDemo: true,
      },
    ],
  });

  console.log("✅ Seed completed successfully! All records verified.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
