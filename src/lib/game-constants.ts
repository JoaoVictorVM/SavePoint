export const GAME_STATUSES = [
  "jogando",
  "zerado",
  "para_jogar",
  "abandonado",
  "quero_jogar",
] as const;

export type GameStatus = (typeof GAME_STATUSES)[number];

export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  jogando: "Jogando",
  zerado: "Zerado",
  para_jogar: "Para Jogar",
  abandonado: "Abandonado",
  quero_jogar: "Quero Jogar",
};
