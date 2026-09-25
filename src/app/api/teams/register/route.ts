import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, signToken, logActivity } from "@/lib/auth";
import { teamRegistrationSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = teamRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Fetch Hackathon & check registration status
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: data.hackathonId },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    if (
      hackathon.status !== "REGISTRATION_OPEN" &&
      hackathon.status !== "UPCOMING"
    ) {
      return NextResponse.json(
        { error: "Registration for this hackathon is currently closed." },
        { status: 400 }
      );
    }

    // 2. Validate Team Size
    const totalMembers = data.members.length;
    if (
      totalMembers < hackathon.minTeamSize ||
      totalMembers > hackathon.maxTeamSize
    ) {
      return NextResponse.json(
        {
          error: `Team size must be between ${hackathon.minTeamSize} and ${hackathon.maxTeamSize} members. You submitted ${totalMembers}.`,
        },
        { status: 400 }
      );
    }

    // 3. Check Duplicate Team Name in this Hackathon
    const existingTeam = await prisma.team.findFirst({
      where: {
        hackathonId: data.hackathonId,
        name: { equals: data.teamName },
      },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: `A team named "${data.teamName}" is already registered in this hackathon.` },
        { status: 409 }
      );
    }

    // 4. Check Duplicate Member Emails in this Hackathon
    const memberEmails = data.members.map((m) => m.email.toLowerCase());
    const existingMembers = await prisma.teamMember.findMany({
      where: {
        email: { in: memberEmails },
        team: { hackathonId: data.hackathonId },
      },
      include: { team: true },
    });

    if (existingMembers.length > 0) {
      const duplicate = existingMembers[0];
      return NextResponse.json(
        {
          error: `Participant ${duplicate.email} is already registered under team "${duplicate.team.name}".`,
        },
        { status: 409 }
      );
    }

    // 5. Authenticate or Create Leader User
    let currentUser = await getCurrentUser();
    let isNewUserCreated = false;
    let newAuthToken: string | null = null;

    if (!currentUser) {
      // Find or create user with leader email
      let user = await prisma.user.findUnique({
        where: { email: data.leaderEmail.toLowerCase() },
      });

      if (!user) {
        const defaultPasswordHash = await hashPassword("HackNexusPass2026!");
        user = await prisma.user.create({
          data: {
            name: data.leaderName,
            email: data.leaderEmail.toLowerCase(),
            passwordHash: defaultPasswordHash,
            role: "PARTICIPANT",
            phone: data.leaderPhone,
          },
        });
        isNewUserCreated = true;
      }

      currentUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      newAuthToken = await signToken(currentUser);
    }

    // 6. Generate Unique Registration & Transaction numbers
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const regNumber = `HACK-2026-${randomSuffix}`;
    const txnId = `TXN-2026-${randomSuffix}`;

    // 7. Atomic Database Creation Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Team
      const team = await tx.team.create({
        data: {
          hackathonId: data.hackathonId,
          name: data.teamName,
          leaderId: currentUser!.id,
          themeId: data.themeId,
          problemId: data.problemId,
          college: data.college,
          department: data.department,
          city: data.city,
          state: data.state,
          country: data.country || "India",
          status: "REGISTERED",
        },
      });

      // Create Team Members
      for (const m of data.members) {
        await tx.teamMember.create({
          data: {
            teamId: team.id,
            name: m.name,
            email: m.email.toLowerCase(),
            college: m.college || data.college,
            department: m.department || data.department,
            role: m.role || "DEVELOPER",
            isLeader: m.isLeader || false,
          },
        });
      }

      // Create Initial Placeholder Prototype Record (To be submitted at end of hackathon)
      const prototype = await tx.prototype.create({
        data: {
          teamId: team.id,
          prototypeUrl: data.prototypeUrl || "",
          githubUrl: data.githubUrl || "",
          videoUrl: data.videoUrl || null,
          projectDescription: data.projectDescription || "",
          technologies: data.technologies || "",
          status: "NOT_SUBMITTED",
        },
      });

      // Create Registration Record
      const registration = await tx.registration.create({
        data: {
          registrationNumber: regNumber,
          hackathonId: data.hackathonId,
          teamId: team.id,
          feeAmount: hackathon.registrationFee,
          currency: hackathon.currency,
          status: "PENDING",
        },
      });

      // Create Initial Payment Record
      const payment = await tx.payment.create({
        data: {
          transactionId: txnId,
          registrationId: registration.id,
          teamId: team.id,
          amount: hackathon.registrationFee,
          currency: hackathon.currency,
          gateway: "DEMO",
          status: "PENDING",
          isDemo: true,
        },
      });

      return { team, registration, payment, prototype };
    });

    // 8. Log Activity
    await logActivity({
      actorId: currentUser.id,
      actorEmail: currentUser.email,
      action: "TEAM_REGISTERED",
      entity: "Team",
      entityId: result.team.id,
      metadata: {
        teamName: data.teamName,
        registrationNumber: regNumber,
        hackathon: hackathon.name,
      },
    });

    // 9. Send response (and set session cookie if newly registered)
    const response = NextResponse.json({
      success: true,
      teamId: result.team.id,
      registrationId: result.registration.id,
      registrationNumber: result.registration.registrationNumber,
      transactionId: result.payment.transactionId,
      amount: result.payment.amount,
      currency: result.payment.currency,
      hackathonName: hackathon.name,
      teamName: data.teamName,
    });

    if (newAuthToken) {
      response.cookies.set("auth_token", newAuthToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Team registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
