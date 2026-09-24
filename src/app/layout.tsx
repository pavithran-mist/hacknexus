import type { Metadata } from "next";
import "./globals.css";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

export const metadata: Metadata = {
  title: "HACKNEXUS — Build. Innovate. Compete.",
  description:
    "Real production hackathon management platform for multi-track competitions, problem statements, participant registration, judging, and analytics.",
  keywords: ["hackathon", "innovation", "technology competition", "hacknexus", "coding sprint"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#111827] text-[#F9FAFB] min-h-screen antialiased selection:bg-primary selection:text-white">
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
