export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header will be added here */}
      <header className="h-[72px] border-b border-[#E4E4E7] flex items-center px-6 justify-between bg-white">
        <span className="text-xl font-bold text-[#18181B]">
          Save<span className="text-[#06E09B]">Point</span>
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#06E09B]/10 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4 text-[#06E09B]" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" />
            </svg>
            <span className="text-sm font-bold font-mono text-[#18181B]">0,00</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#E4E4E7] flex items-center justify-center text-xs font-semibold text-[#71717A]">
            U
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
