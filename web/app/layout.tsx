import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fortify — Your Financial OS",
  description: "Intercept spending. Route every dollar. Build habits that compound. Built for 18–25 year-olds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-ink min-h-screen font-body">
        {children}
      </body>
    </html>
  );
}
