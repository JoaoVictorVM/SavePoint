import { redirect, notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { games } from "@/schema/games";
import { tags } from "@/schema/tags";
import { gameTags } from "@/schema/gameTags";
import { getQuestsForGame } from "@/actions/quests";
import { getUserTags } from "@/actions/tags";
import { GameDetailClient } from "@/components/games/GameDetailClient";

interface GameDetailPageProps {
  params: Promise<{ gameId: string }>;
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { gameId } = await params;

  // Fetch game with ownership check
  const [game] = await db
    .select()
    .from(games)
    .where(and(eq(games.id, gameId), eq(games.userId, session.id)))
    .limit(1);

  if (!game) notFound();

  // Fetch quests, user tags, and game tags in parallel
  const [questList, userTags, gameTagRows] = await Promise.all([
    getQuestsForGame(gameId),
    getUserTags(),
    db
      .select({
        tagId: gameTags.tagId,
        tagName: tags.name,
        tagColor: tags.color,
      })
      .from(gameTags)
      .innerJoin(tags, eq(gameTags.tagId, tags.id))
      .where(eq(gameTags.gameId, gameId)),
  ]);

  const gameTagList = gameTagRows.map((row) => ({
    id: row.tagId,
    userId: session.id,
    name: row.tagName,
    color: row.tagColor,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return (
    <GameDetailClient
      initialUser={session}
      initialGame={game}
      initialQuests={questList}
      initialTags={userTags}
      initialGameTags={gameTagList}
    />
  );
}
