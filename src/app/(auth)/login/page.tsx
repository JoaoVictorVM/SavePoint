import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-[440px] bg-[var(--color-bg-surface)] rounded-[24px] shadow-[var(--shadow-medium)] p-10 border border-[var(--color-border)]">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)]">
          Save<span className="text-[var(--color-accent)]">Point</span>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          Organize sua jornada gamer
        </p>
      </div>

      <LoginForm />

      <p className="text-sm text-center mt-6 text-[var(--color-text-muted)]">
        Não tem conta?{" "}
        <Link
          href="/register"
          className="text-[var(--color-accent)] hover:underline font-medium"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
