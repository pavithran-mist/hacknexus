import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(2, "Enter your email or username").optional(),
  email: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30).optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const teamMemberSchema = z.object({
  name: z.string().min(2, "Member name is required"),
  email: z.string().email("Valid member email is required"),
  phone: z.string().optional(),
  college: z.string().optional().default(""),
  department: z.string().optional().default(""),
  role: z.enum(["DEVELOPER", "DESIGNER", "AIML", "RESEARCHER", "OTHER"]).default("DEVELOPER"),
  isLeader: z.boolean().default(false),
});

export const teamRegistrationSchema = z.object({
  hackathonId: z.string().min(1, "Hackathon ID is required"),
  teamName: z.string().min(3, "Team name must be at least 3 characters").max(50),
  leaderName: z.string().min(2, "Leader name is required"),
  leaderEmail: z.string().email("Valid leader email is required"),
  leaderPhone: z.string().min(10, "Valid 10-digit phone number is required"),
  college: z.string().min(2, "College is required"),
  department: z.string().min(2, "Department is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().default("India"),
  themeId: z.string().min(1, "Please select a theme"),
  problemId: z.string().min(1, "Please select a problem statement"),
  members: z.array(teamMemberSchema).min(1, "At least one team member is required"),
  prototypeUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional().default(""),
  githubUrl: z.string().url("Must be a valid GitHub URL").or(z.literal("")).optional().default(""),
  videoUrl: z.string().url("Must be a valid Video URL").or(z.literal("")).optional().default(""),
  projectDescription: z.string().min(20, "Project description must be at least 20 characters"),
  technologies: z.string().min(2, "Technologies list is required"),
});

export const prototypeSubmissionSchema = z.object({
  prototypeUrl: z.string().url("Must be a valid prototype URL"),
  githubUrl: z.string().url("Must be a valid GitHub URL"),
  videoUrl: z.string().url("Must be a valid Demo Video URL").optional().or(z.literal("")),
  projectDescription: z.string().min(20, "Project description must be at least 20 characters"),
  technologies: z.string().min(2, "Technologies list is required"),
});

export const finalSubmissionSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  hackathonId: z.string().min(1, "Hackathon ID is required"),
  projectTitle: z.string().min(3, "Project title must be at least 3 characters"),
  projectDescription: z.string().min(30, "Project description must be at least 30 characters"),
  prototypeUrl: z.string().url("Must be a valid prototype URL"),
  githubUrl: z.string().url("Must be a valid GitHub repository URL"),
  demoVideoUrl: z.string().url("Must be a valid demo video URL").optional().or(z.literal("")),
  pptUrl: z.string().url("Must be a valid presentation link (Google Slides, Canva, Drive)").optional().or(z.literal("")),
  documentationUrl: z.string().url("Must be a valid documentation link").optional().or(z.literal("")),
  technologies: z.string().min(2, "Technologies used are required"),
  expectedImpact: z.string().min(20, "Expected impact is required"),
  futureScope: z.string().min(20, "Future scope is required"),
});

export const evaluationScoreSchema = z.object({
  assignmentId: z.string().min(1),
  submissionId: z.string().min(1),
  scores: z.array(
    z.object({
      criterionId: z.string().min(1),
      score: z.number().min(0).max(100),
      feedback: z.string().optional(),
    })
  ),
  overallFeedback: z.string().optional(),
});

export const hackathonConfigSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  tagline: z.string().min(5),
  description: z.string().min(10),
  registrationFee: z.number().min(0),
  currency: z.string().default("INR"),
  minTeamSize: z.number().min(1),
  maxTeamSize: z.number().min(1),
  registrationStartDate: z.string(),
  registrationDeadline: z.string(),
  hackathonStartDate: z.string(),
  hackathonEndDate: z.string(),
  submissionDeadline: z.string(),
  status: z.enum([
    "UPCOMING",
    "REGISTRATION_OPEN",
    "REGISTRATION_CLOSED",
    "ONGOING",
    "SUBMISSION_OPEN",
    "SUBMISSION_CLOSED",
    "JUDGING",
    "COMPLETED",
  ]),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

export const themeSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  icon: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  order: z.number().default(0),
});

export const problemStatementSchema = z.object({
  themeId: z.string().min(1),
  problemCode: z.string().min(2),
  title: z.string().min(3),
  description: z.string().min(20),
  organization: z.string().min(2),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  technologies: z.string().min(2),
  requirements: z.string().min(10),
  expectedOutput: z.string().min(10),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const announcementSchema = z.object({
  title: z.string().min(3),
  message: z.string().min(10),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  targetAudience: z.enum(["EVERYONE", "PARTICIPANTS", "JUDGES"]).default("EVERYONE"),
  expiryDate: z.string().optional(),
});
