"use client";

import { Sidebar } from "./Sidebar";

interface AppShellProps {
  username: string;
  goldBalance: number;
  onOpenTagManager: () => void;
  onOpenPlatformManager: () => void;
  children: React.ReactNode;
}

export function AppShell({
  username,
  goldBalance,
  onOpenTagManager,
  onOpenPlatformManager,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        username={username}
        onOpenTagManager={onOpenTagManager}
        onOpenPlatformManager={onOpenPlatformManager}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
