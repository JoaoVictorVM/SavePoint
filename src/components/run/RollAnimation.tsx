"use client";

export function RollAnimation() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Card container with pulsing glow */}
      <div
        className="w-[220px] h-[300px] rounded-[16px] border-2 border-[#06E09B] flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#06E09B]/10 to-[#0A0A0B]/5"
        style={{
          animation: "rollGlow 0.8s ease-in-out infinite",
          boxShadow: "0 0 30px rgba(6, 224, 155, 0.25)",
        }}
      >
        {/* Spinning dice icon */}
        <div style={{ animation: "rollSpin 0.6s linear infinite" }}>
          <svg className="w-16 h-16 text-[#06E09B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.25}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
          </svg>
        </div>

        {/* Scanning line */}
        <div className="w-3/4 h-0.5 bg-[#06E09B]/50 rounded-full" style={{ animation: "scanWidth 0.4s ease-in-out infinite alternate" }} />
      </div>

      {/* Sorteando... with bouncing dots */}
      <div className="flex items-center gap-1 text-[#06E09B] font-medium text-sm">
        <span>Sorteando</span>
        <span style={{ animation: "dotBounce 0.8s ease-in-out infinite" }}>.</span>
        <span style={{ animation: "dotBounce 0.8s ease-in-out 0.2s infinite" }}>.</span>
        <span style={{ animation: "dotBounce 0.8s ease-in-out 0.4s infinite" }}>.</span>
      </div>

      <style>{`
        @keyframes rollGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 224, 155, 0.2); border-color: rgba(6, 224, 155, 0.6); }
          50% { box-shadow: 0 0 50px rgba(6, 224, 155, 0.5); border-color: rgba(6, 224, 155, 1); }
        }
        @keyframes rollSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scanWidth {
          from { width: 20%; opacity: 0.4; }
          to { width: 80%; opacity: 1; }
        }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
