import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAYA Design & Build | Engineering, Interior Design & Turnkey Construction",
  description:
    "Premier architectural design, 3D visualization, civil engineering PMS, and turnkey construction in Bardoli, Gujarat. Established in 2021 by Er. Lalit Choudhary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F9F6F5] text-[#032D47] font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
