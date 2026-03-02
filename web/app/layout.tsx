import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FortiFi — Outsmart Risk. Build Wealth.",
  description: "Your financial OS. Intercept spending decisions, route every dollar, build habits that compound.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#060D1A] text-[#EEF4FF] min-h-screen">
        {children}
      </body>
    </html>
  );
}
