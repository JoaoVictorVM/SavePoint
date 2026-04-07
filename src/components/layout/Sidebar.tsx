"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/actions/auth";

interface SidebarProps {
  username: string;
  onOpenTagManager: () => void;
}

export function Sidebar({ username, onOpenTagManager }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`
        flex flex-col h-screen bg-white border-r border-[#E4E4E7] shrink-0
        transition-all duration-200 ease-in-out
        ${isCollapsed ? "w-[68px]" : "w-[240px]"}
      `}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between h-[72px] px-4 border-b border-[#E4E4E7]">
        {!isCollapsed && (
          <Link href="/dashboard" className="text-xl font-bold text-[#18181B]">
            Save<span className="text-[#06E09B]">Point</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors cursor-pointer ${isCollapsed ? "mx-auto" : ""}`}
          aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium
                    transition-colors
                    ${
                      isActive
                        ? "bg-[#06E09B]/10 text-[#06E09B]"
                        : "text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5]"
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="relative border-t border-[#E4E4E7] p-3" ref={userMenuRef}>
        {/* User menu dropdown (opens upward) */}
        {isUserMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-[12px] shadow-[var(--shadow-medium)] border border-[#E4E4E7] py-1 z-50">
            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                onOpenTagManager();
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-[#18181B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
            >
              Tags
            </button>
            <form action={logoutUser}>
              <button
                type="submit"
                className="w-full text-left px-4 py-2.5 text-sm text-[#FF453A] hover:bg-[#FF453A]/5 transition-colors cursor-pointer"
              >
                Sair
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-[12px]
            hover:bg-[#F4F4F5] transition-colors cursor-pointer
            ${isCollapsed ? "justify-center" : ""}
          `}
          aria-label="Menu do usuário"
          aria-expanded={isUserMenuOpen}
        >
          <div className="w-8 h-8 rounded-full bg-[#06E09B]/15 border border-[#06E09B]/30 flex items-center justify-center text-sm font-semibold text-[#06E09B] shrink-0">
            {initial}
          </div>
          {!isCollapsed && (
            <span className="text-sm font-medium text-[#18181B] truncate">
              {username}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
