import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[440px] bg-[var(--color-bg-surface)] rounded-[24px] shadow-[var(--shadow-medium)] p-10 border border-[var(--color-border)]">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)]">
          Save<span className="text-[var(--color-interactive)]">Point</span>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          Crie sua conta e comece sua jornada
        </p>
      </div>

      <RegisterForm />

      <p className="text-sm text-center mt-6 text-[var(--color-text-muted)]">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-[var(--color-interactive)] hover:underline font-medium"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
