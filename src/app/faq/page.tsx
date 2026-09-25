import { prisma } from "@/lib/prisma";
import { HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FAQPage() {
  const content = await prisma.websiteContent.findFirst({
    include: { hackathon: true },
  });

  let faqs = [
    {
      question: "Who is eligible to participate?",
      answer: "Undergraduate, postgraduate students, and early-career software developers worldwide are eligible. Teams can consist of members from different institutions.",
      category: "Eligibility",
    },
    {
      question: "What is the team size requirement?",
      answer: "Squads must consist of between 2 and 4 members as per the competition configuration.",
      category: "Teams",
    },
    {
      question: "How does the registration payment work?",
      answer: `The registration fee is ₹${content?.hackathon.registrationFee || 499} per team. Payments can be completed online via UPI, Cards, or NetBanking through our secure payment gateway. Both live gateway and demo modes are supported.`,
      category: "Payment",
    },
    {
      question: "When and where do I submit my prototype and project files?",
      answer: "Prototypes, GitHub repositories, and video demos are submitted through your Participant Dashboard Final Submission page as you approach code freeze.",
      category: "Submission",
    },
    {
      question: "How are projects evaluated?",
      answer: "Projects are evaluated by an expert jury panel across 5 weighted dimensions: Innovation & Uniqueness (25%), Technical Implementation (25%), Problem Relevance & Impact (20%), Usability & UI/UX (15%), and Presentation (15%).",
      category: "Judging",
    },
  ];

  if (content?.faqJson) {
    try {
      const parsed = JSON.parse(content.faqJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        faqs = parsed;
      }
    } catch {
      // Use defaults
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Frequently Asked Questions</h1>
        <p className="text-sm text-muted-foreground">
          Everything you need to know about team formation, payment, prototype submission, and judging.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="group bg-card border border-border rounded-xl p-5 open:border-primary/50 transition-colors"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-bold text-white">
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" /> {faq.question}
              </span>
              <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">
                ▼
              </span>
            </summary>
            <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground leading-relaxed pl-6">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
