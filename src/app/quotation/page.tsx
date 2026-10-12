import { redirect } from "next/navigation";
import { getActiveCalculators } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export default async function QuotationPage() {
  const calcs = await getActiveCalculators();
  const targetSlug = calcs[0]?.slug || "consultation-services-calculator";
  redirect(`/calculator/${targetSlug}`);
}
