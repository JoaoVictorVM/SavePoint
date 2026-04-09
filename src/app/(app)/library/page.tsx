import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getGames } from "@/actions/games";
import { getUserTags } from "@/actions/tags";
import { getUserPlatforms } from "@/actions/platforms";
import { LibraryClient } from "@/components/library/LibraryClient";

export default async function LibraryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [games, tags, platforms] = await Promise.all([
    getGames(),
    getUserTags(),
    getUserPlatforms(),
  ]);

  return (
    <LibraryClient
      initialUser={session}
      initialGames={games}
      initialTags={tags}
      initialPlatforms={platforms}
    />
  );
}
