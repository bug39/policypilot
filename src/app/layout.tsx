import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolicyPilot — Intelligent Compliance Decision Engine",
  description:
    "Proactive policy conflict resolution for customer support agents. Powered by Algolia Agent Studio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
