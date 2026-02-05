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
    <html lang="en" className="dark">
      <body className="bg-slate-925 text-gray-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
