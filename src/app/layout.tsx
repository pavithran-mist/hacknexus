import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0D1117",
};

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
