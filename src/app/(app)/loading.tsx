/**
 * Loading boundary do route group (app).
 * Next.js automaticamente envolve as páginas em Suspense usando este arquivo —
 * mostrado enquanto os Server Components da rota fazem fetch dos dados.
 */
export default function Loading() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar skeleton — mantém estrutura visual durante carregamento */}
      <aside className="w-[240px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-base)]">
        <div className="h-[72px] border-b border-[var(--color-border)] flex items-center px-4">
          <div className="h-6 w-24 rounded bg-[var(--color-bg-elevated)] animate-pulse" />
        </div>
        <div className="p-3 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-[12px] bg-[var(--color-bg-elevated)] animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </aside>

      {/* Conteúdo skeleton */}
      <main className="flex-1 overflow-hidden p-6 md:p-8">
        <div className="space-y-6 max-w-[1400px] mx-auto">
          <div className="h-9 w-48 rounded bg-[var(--color-bg-elevated)] animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-[16px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          <div className="h-64 rounded-[16px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] animate-pulse" />
        </div>
      </main>
    </div>
  );
}
