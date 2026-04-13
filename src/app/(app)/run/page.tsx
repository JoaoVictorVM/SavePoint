import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getGames } from "@/actions/games";
import { getUserTags } from "@/actions/tags";
import { getUserPlatforms } from "@/actions/platforms";
import { RunPageClient } from "@/components/run/RunPageClient";

export default async function RunPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [games, tags, platforms] = await Promise.all([
    getGames(),
    getUserTags(),
    getUserPlatforms(),
  ]);

  return (
    <RunPageClient
      initialUser={session}
      initialGames={games}
      initialTags={tags}
      initialPlatforms={platforms}
    />
  );
}
