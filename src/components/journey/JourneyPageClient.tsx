"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { AppShell } from "@/components/layout/AppShell";
import { TagManager } from "@/components/tags/TagManager";
import { PlatformManager } from "@/components/platforms/PlatformManager";
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
  const openPlatformManager = useAppStore((s) => s.openPlatformManager);
  const isPlatformManagerOpen = useAppStore((s) => s.isPlatformManagerOpen);
  const closePlatformManager = useAppStore((s) => s.closePlatformManager);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser, setUser]);

  return (
    <AppShell
      username={user?.username || initialUser.username}
      goldBalance={user?.goldBalance ?? initialUser.goldBalance}
      onOpenTagManager={openTagManager}
      onOpenPlatformManager={openPlatformManager}
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Journey
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Organize seus jogos por etapa
          </p>
        </header>

        <KanbanBoard initialData={initialData} />
      </div>

      <TagManager isOpen={isTagManagerOpen} onClose={closeTagManager} />
      <PlatformManager isOpen={isPlatformManagerOpen} onClose={closePlatformManager} />
    </AppShell>
  );
}
