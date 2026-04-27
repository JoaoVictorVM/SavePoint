import type { Platform } from "@/schema/platforms";
import { mockSession } from "./session";

export const mockPlatforms: Platform[] = [
  {
    id: "33333333-0000-0000-0000-000000000001",
    userId: mockSession.id,
    name: "PC",
    color: "#5E81AC",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "33333333-0000-0000-0000-000000000002",
    userId: mockSession.id,
    name: "PlayStation 5",
    color: "#88C0D0",
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02"),
  },
];
