export function GameCardSkeleton() {
  return (
    <div className="rounded-[16px] border border-[#E4E4E7] bg-white overflow-hidden animate-pulse">
      <div className="h-[160px] bg-[#E4E4E7]" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-[#E4E4E7] rounded-full w-3/4" />
        <div className="flex gap-1.5">
          <div className="h-5 bg-[#E4E4E7] rounded-full w-16" />
          <div className="h-5 bg-[#E4E4E7] rounded-full w-12" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 bg-[#E4E4E7] rounded-full w-20" />
          <div className="h-3 bg-[#E4E4E7] rounded-full w-full" />
          <div className="h-1 bg-[#E4E4E7] rounded-full w-full" />
        </div>
      </div>
    </div>
  );
}
