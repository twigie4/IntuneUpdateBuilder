import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intune Update Builder",
  description:
    "Generate Intune Win32 PowerShell scripts for KB-based Windows Updates (Pattern C)."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
