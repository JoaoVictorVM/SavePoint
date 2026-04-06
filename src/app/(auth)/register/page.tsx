import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[440px] bg-white rounded-[24px] shadow-[var(--shadow-medium)] p-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#18181B]">
          Save<span className="text-[#06E09B]">Point</span>
        </h1>
        <p className="text-sm text-[#71717A] mt-2">
          Crie sua conta e comece sua jornada
        </p>
      </div>

      {/* RegisterForm will be added here */}
      <div className="space-y-4">
        <div className="h-11 rounded-full border border-[#E4E4E7] bg-[#FAFAFA] animate-pulse" />
        <div className="h-11 rounded-full border border-[#E4E4E7] bg-[#FAFAFA] animate-pulse" />
        <div className="h-11 rounded-full border border-[#E4E4E7] bg-[#FAFAFA] animate-pulse" />
        <div className="h-11 rounded-full border border-[#E4E4E7] bg-[#FAFAFA] animate-pulse" />
        <div className="h-12 rounded-full bg-[#06E09B]/30 animate-pulse" />
      </div>

      <p className="text-sm text-center mt-6 text-[#71717A]">
        Já tem conta?{" "}
        <Link href="/login" className="text-[#06E09B] hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </div>
  );
}
