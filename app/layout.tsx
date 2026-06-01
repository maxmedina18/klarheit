import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klarheit",
  description:
    "A personal finance cockpit for income, expenses, budgets, recovery, and execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}