"use client";

import { GoldDisplay } from "./GoldDisplay";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  username: string;
  goldBalance: number;
  onOpenTagManager: () => void;
}

export function Header({
  username,
  goldBalance,
  onOpenTagManager,
}: HeaderProps) {
  return (
    <header className="h-[72px] border-b border-[#E4E4E7] flex items-center px-6 justify-between bg-white shrink-0">
      <span className="text-xl font-bold text-[#18181B]">
        Save<span className="text-[#06E09B]">Point</span>
      </span>

      <div className="flex items-center gap-4">
        <GoldDisplay amount={goldBalance} animate />
        <UserMenu username={username} onOpenTagManager={onOpenTagManager} />
      </div>
    </header>
  );
}
