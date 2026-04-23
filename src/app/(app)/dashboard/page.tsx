import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDashboardData } from "@/actions/dashboard";
import { getUserTags } from "@/actions/tags";
import { getUserPlatforms } from "@/actions/platforms";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [dashboardData, tags, platforms] = await Promise.all([
    getDashboardData("yearly"), // padrão: Anual
    getUserTags(),
    getUserPlatforms(),
  ]);

  return (
    <DashboardClient
      initialUser={session}
      initialData={dashboardData}
      initialTags={tags}
      initialPlatforms={platforms}
    />
  );
}
