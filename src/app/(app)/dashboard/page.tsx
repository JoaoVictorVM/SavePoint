import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getGames } from "@/actions/games";
import { getUserTags } from "@/actions/tags";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [games, tags] = await Promise.all([getGames(), getUserTags()]);

  return (
    <DashboardClient
      initialUser={session}
      initialGames={games}
      initialTags={tags}
    />
  );
}
