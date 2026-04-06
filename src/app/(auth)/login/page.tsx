import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-[440px] bg-white rounded-[24px] shadow-[var(--shadow-medium)] p-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#18181B]">
          Save<span className="text-[#06E09B]">Point</span>
        </h1>
        <p className="text-sm text-[#71717A] mt-2">
          Organize sua jornada gamer
        </p>
      </div>

      <LoginForm />

      <p className="text-sm text-center mt-6 text-[#71717A]">
        Não tem conta?{" "}
        <Link
          href="/register"
          className="text-[#06E09B] hover:underline font-medium"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
