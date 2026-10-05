import React from "react";
import Link from "next/link";
import { getPublicSettings } from "@/lib/public-api";
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
    <div className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] flex flex-col justify-between selection:bg-[#C5A869]/30 selection:text-white">
      {/* Header Bar */}
      <header className="border-b border-[#2B313D] bg-[#0D0F12]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="inline-block group">
            <span className="text-xl sm:text-2xl font-black tracking-[0.2em] text-[#C5A869]">
              MAYA
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 block font-medium">
              Design &amp; Build
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-[#C5A869] transition"
          >
            &larr; Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-8">
        <div className="space-y-3 pb-6 border-b border-[#2B313D]">
          <span className="text-xs font-mono uppercase tracking-widest text-[#C5A869] font-bold">
            Data Protection &amp; Confidentiality
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Commitment to Client Information Security
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed space-y-6 text-sm">
          {rawPrivacy ? (
            <div className="whitespace-pre-wrap">{rawPrivacy}</div>
          ) : (
            <div className="space-y-4">
              <p>
                At <strong>MAYA Design &amp; Build</strong>, we hold the privacy of our clients and
                site visitors in highest regard.
              </p>
              <h3 className="text-lg font-bold text-white mt-6">1. Information We Collect</h3>
              <p>
                When you initiate a consultation or calculate an architectural estimate on our
                platform, we collect only the necessary information to serve you: your name, contact
                phone number, email address, site location, and specific project requirements.
              </p>
              <h3 className="text-lg font-bold text-white mt-6">2. Use of Information</h3>
              <p>
                Your contact and project details are utilized exclusively to prepare structural
                estimates, schedule site visits, and coordinate turnkey architectural contracts. We
                do not sell, rent, or distribute your information to any third-party marketing
                entities.
              </p>
              <h3 className="text-lg font-bold text-white mt-6">3. Data Security</h3>
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
