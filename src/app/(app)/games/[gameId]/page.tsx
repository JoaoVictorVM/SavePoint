import Link from "next/link";

export default function GameDetailPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="text-sm text-[#71717A] hover:text-[#06E09B] transition-colors mb-6 inline-block"
      >
        ← Dashboard
      </Link>

      {/* Game header placeholder */}
      <div className="w-full h-[200px] rounded-[16px] bg-gradient-to-br from-[#06E09B]/20 to-[#0A0A0B]/10 mb-6 animate-pulse" />

      <h1 className="text-4xl font-bold text-[#18181B] mb-4">
        Carregando jogo...
      </h1>

      {/* Active quest panel placeholder */}
      <div className="rounded-[16px] border border-[#06E09B]/30 bg-[#06E09B]/5 p-6 mb-8">
        <div className="text-center text-[#71717A]">
          <p className="font-medium">Nenhuma quest ativa</p>
          <p className="text-sm mt-1">
            Ative uma quest abaixo para rastrear seu progresso.
          </p>
        </div>
      </div>

      {/* Quest list placeholder */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3 opacity-40">📜</div>
        <h3 className="text-lg font-semibold text-[#18181B] mb-1">
          Nenhuma quest ainda
        </h3>
        <p className="text-sm text-[#71717A] mb-4">
          Crie sua primeira quest para começar a rastrear progresso.
        </p>
        <button className="h-10 px-5 rounded-full bg-[#06E09B] text-[#18181B] font-semibold text-sm cursor-pointer hover:bg-[#05c889] transition-colors">
          + Criar Quest
        </button>
      </div>
    </div>
  );
}
