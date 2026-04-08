import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getJourneyData } from "@/actions/journey";
import { JourneyPageClient } from "@/components/journey/JourneyPageClient";

export default async function JourneyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getJourneyData();

  return (
    <JourneyPageClient
      initialUser={session}
      initialData={data}
    />
  );
}
