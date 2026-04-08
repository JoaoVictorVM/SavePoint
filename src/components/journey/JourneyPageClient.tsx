"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { AppShell } from "@/components/layout/AppShell";
import { TagManager } from "@/components/tags/TagManager";
import { KanbanBoard } from "./KanbanBoard";
import type { UserSession } from "@/lib/types";
import type { JourneyData } from "@/lib/journey-constants";

interface JourneyPageClientProps {
  initialUser: UserSession;
  initialData: JourneyData;
}

export function JourneyPageClient({
  initialUser,
  initialData,
}: JourneyPageClientProps) {
  const setUser = useAppStore((s) => s.setUser);
  const user = useAppStore((s) => s.user);
  const openTagManager = useAppStore((s) => s.openTagManager);
  const isTagManagerOpen = useAppStore((s) => s.isTagManagerOpen);
  const closeTagManager = useAppStore((s) => s.closeTagManager);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser, setUser]);

  return (
    <AppShell
      username={user?.username || initialUser.username}
      goldBalance={user?.goldBalance ?? initialUser.goldBalance}
      onOpenTagManager={openTagManager}
    >
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold text-[#18181B] mb-6">Journey</h1>
        <KanbanBoard initialData={initialData} />
      </div>

      <TagManager isOpen={isTagManagerOpen} onClose={closeTagManager} />
    </AppShell>
  );
}
