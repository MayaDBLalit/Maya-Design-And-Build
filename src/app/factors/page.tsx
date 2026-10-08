import React from "react";
import { FactorsExperience, FiveFactorData } from "@/components/public/factors/FactorsExperience";
import { getFiveFactors } from "@/lib/public-api";
import { INITIAL_FIVE_FACTORS } from "@/db/seeds/five-factors";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MAYA – Five elements. One living experience.",
  description:
    "Explore the Five Elemental Factors of MAYA Design & Build: Space (Akash), Air (Vayu), Fire (Agni), Water (Jal), and Earth (Prithvi).",
};

export default async function FactorsPage() {
  const dbFactors = await getFiveFactors();

  // Ensure factors exist even if DB is warming up
  const factors: FiveFactorData[] =
    dbFactors.length > 0
      ? dbFactors.map((f) => ({
          id: f.id,
          factorType: f.factorType as "space" | "air" | "fire" | "water" | "earth",
          titleEnglish: f.titleEnglish,
          titleHindi: f.titleHindi,
          iconImage: f.iconImage,
          tagline: f.tagline,
          detailsText: f.detailsText,
          impactPoints: (f.impactPoints as string[]) || [],
          updatedAt: f.updatedAt,
        }))
      : INITIAL_FIVE_FACTORS.map((f, idx) => ({
          id: idx + 1,
          factorType: f.factorType as "space" | "air" | "fire" | "water" | "earth",
          titleEnglish: f.titleEnglish,
          titleHindi: f.titleHindi,
          iconImage: f.iconImage,
          tagline: f.tagline,
          detailsText: f.detailsText,
          impactPoints: f.impactPoints,
          updatedAt: new Date().toISOString(),
        }));

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Serif+Devanagari:wght@400;500;600&display=swap"
      />
      <link rel="preload" as="image" href="/images/factors-background.jpg" />
      <FactorsExperience factors={factors} />
    </>
  );
}
