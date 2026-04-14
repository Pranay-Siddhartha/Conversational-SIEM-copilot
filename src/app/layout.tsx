import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIEM Copilot — AI Security Operations Center",
  description:
    "AI-powered Conversational SIEM Copilot for cybersecurity analysts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
