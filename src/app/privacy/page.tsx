import React from "react";
import { getPublicSettings } from "@/lib/public-api";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { FloatingCallButton } from "@/components/public/FloatingCallButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy — MAYA Design & Build",
  description: "Privacy and personal data guidelines for MAYA Design & Build.",
};

export default async function PrivacyPage() {
  const settings = await getPublicSettings();
  const rawPrivacy = settings.privacy_policy || "";

  return (
    <div className="min-h-screen bg-[#F9F6F5] text-[#032D47] font-sans flex flex-col justify-between selection:bg-[#E1A857] selection:text-[#032D47]">
      {/* Unified Public Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 flex-1 w-full space-y-10">
        <div className="space-y-3 pb-6 border-b border-[#BCC1C4]/40">
          <span className="text-xs font-mono uppercase tracking-widest text-[#966015] font-bold">
            Data Protection &amp; Confidentiality
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#032D47] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#455668] font-mono">
            Commitment to Client Information Security • MAYA Design &amp; Build
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#BCC1C4]/60 p-8 sm:p-12 rounded-xs shadow-xs text-[#455668] leading-relaxed space-y-6 text-sm sm:text-base">
          {rawPrivacy ? (
            <div className="whitespace-pre-wrap">{rawPrivacy}</div>
          ) : (
            <div className="space-y-5">
              <p>
                At <strong className="text-[#032D47]">MAYA Design &amp; Build</strong>, we hold the privacy of our clients and
                site visitors in highest regard.
              </p>
              <h3 className="text-lg font-black text-[#032D47] mt-8 pt-4 border-t border-[#BCC1C4]/30">1. Information We Collect</h3>
              <p>
                When you initiate a consultation or calculate an architectural estimate on our
                platform, we collect only the necessary information to serve you: your name, contact
                phone number, email address, site location, and specific project requirements.
              </p>
              <h3 className="text-lg font-black text-[#032D47] mt-8 pt-4 border-t border-[#BCC1C4]/30">2. Use of Information</h3>
              <p>
                Your contact and project details are utilized exclusively to prepare structural
                estimates, schedule site visits, and coordinate turnkey architectural contracts. We
                do not sell, rent, or distribute your information to any third-party marketing
                entities.
              </p>
              <h3 className="text-lg font-black text-[#032D47] mt-8 pt-4 border-t border-[#BCC1C4]/30">3. Data Security</h3>
              <p>
                All inquiries are securely recorded in our protected database systems. Direct
                administrative access is restricted to authorized MAYA personnel through encrypted
                authentication protocols.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer settings={settings} />

      {/* Floating Call Action Button */}
      <FloatingCallButton phone={settings.contact_phone} />
    </div>
  );
}
