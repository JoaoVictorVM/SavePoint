/**
 * Resolve o SESSION_SECRET com fail-fast em produção.
 *
 * - Em produção: lança erro se SESSION_SECRET não estiver setada (impede deploy
 *   inseguro com fallback hardcoded).
 * - Em dev/test: usa fallback pra não quebrar o workflow local.
 */
const FALLBACK = "dev-secret-change-in-production-min32chars!";

function resolveSecret(): string {
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET ausente ou muito curta (min 32 chars) — obrigatória em produção."
    );
  }

  return FALLBACK;
}

export const SESSION_SECRET_BYTES = new TextEncoder().encode(resolveSecret());
