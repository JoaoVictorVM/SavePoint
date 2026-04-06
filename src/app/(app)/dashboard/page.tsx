export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-8 h-14">
        <input
          type="text"
          placeholder="Buscar jogos..."
          className="h-10 px-4 rounded-full border border-[#E4E4E7] text-sm max-w-[400px] w-full focus:outline-none focus:ring-2 focus:ring-[#06E09B]"
        />
        <div className="ml-auto">
          <button className="h-10 px-5 rounded-full bg-[#06E09B] text-[#18181B] font-semibold text-sm cursor-pointer hover:bg-[#05c889] transition-colors">
            + Novo Jogo
          </button>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4 opacity-40">🎮</div>
        <h2 className="text-2xl font-semibold text-[#18181B] mb-2">
          Nenhum Jogo Encontrado
        </h2>
        <p className="text-sm text-[#71717A] mb-6">
          Adicione seu primeiro jogo para começar sua jornada.
        </p>
        <button className="h-12 px-6 rounded-full bg-[#06E09B] text-[#18181B] font-semibold text-sm cursor-pointer hover:bg-[#05c889] transition-colors">
          + Adicionar Primeiro Jogo
        </button>
      </div>
    </div>
  );
}
