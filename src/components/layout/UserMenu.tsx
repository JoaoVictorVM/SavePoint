"use client";

import { useState, useRef, useEffect } from "react";
import { logoutUser } from "@/actions/auth";

interface UserMenuProps {
  username: string;
  onOpenTagManager: () => void;
}

export function UserMenu({ username, onOpenTagManager }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-[#E4E4E7] flex items-center justify-center text-sm font-semibold text-[#71717A] hover:bg-[#D4D4D8] transition-colors cursor-pointer"
        aria-label="Menu do usuário"
        aria-expanded={isOpen}
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-48 bg-white rounded-[16px] shadow-[var(--shadow-medium)] border border-[#E4E4E7] py-2 z-50">
          <div className="px-4 py-2 border-b border-[#E4E4E7]">
            <p className="text-sm font-medium text-[#18181B] truncate">
              {username}
            </p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenTagManager();
            }}
            className="w-full text-left px-4 py-2 text-sm text-[#18181B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
          >
            Tags
          </button>

          <form action={logoutUser}>
            <button
              type="submit"
              className="w-full text-left px-4 py-2 text-sm text-[#FF453A] hover:bg-[#FF453A]/5 transition-colors cursor-pointer"
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
