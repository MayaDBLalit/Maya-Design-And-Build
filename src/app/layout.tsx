import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAYA Design & Build | Engineering & Construction",
  description: "Premier Engineering, Architectural Visualization, Project Management, and Turnkey Construction in Bardoli.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-amber-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
