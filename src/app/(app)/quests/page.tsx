import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getQuestsGroupedByGame, getUserGamesForSelect } from "@/actions/quests";
import { QuestsPageClient } from "@/components/quests/QuestsPageClient";

export default async function QuestsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [groups, games] = await Promise.all([
    getQuestsGroupedByGame(),
    getUserGamesForSelect(),
  ]);

  return (
    <QuestsPageClient
      initialUser={session}
      initialGroups={groups}
      initialGames={games}
    />
  );
}
