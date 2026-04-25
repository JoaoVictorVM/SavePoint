"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerUser } from "@/actions/auth";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score; // 0-5
}

const strengthLabels = ["", "Fraca", "Fraca", "Média", "Forte", "Muito forte"];
const strengthColors = ["", "#BF616A", "#BF616A", "#EBCB8B", "#A3BE8C", "#88C0D0"];

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    }),
    [password]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "As senhas não coincidem" });
      return;
    }

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await registerUser(formData);

    if (result.success) {
      router.push("/library");
      return;
    }

    setIsLoading(false);

    if (result.fieldErrors) {
      const mapped: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(result.fieldErrors)) {
        mapped[key] = msgs[0];
      }
      setErrors(mapped);
    } else {
      setGlobalError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {globalError && (
        <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-[16px] px-4 py-3 text-sm text-[var(--color-error)]">
          {globalError}
        </div>
      )}

      <Input
        name="username"
        type="text"
        label="Username"
        placeholder="ex: lucas_gamer"
        error={errors.username}
        disabled={isLoading}
        required
      />

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="seu@email.com"
        error={errors.email}
        disabled={isLoading}
        required
      />

      <div>
        <Input
          name="password"
          type="password"
          label="Senha"
          placeholder="Mínimo 8 caracteres"
          error={errors.password}
          disabled={isLoading}
          showPasswordToggle
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Password strength bar */}
        {password.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <div className="flex gap-1 h-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className="flex-1 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor:
                      strength >= level ? strengthColors[strength] : "var(--color-bg-elevated)",
                  }}
                />
              ))}
            </div>
            <p
              className="text-xs font-medium"
              style={{ color: strengthColors[strength] }}
            >
              {strengthLabels[strength]}
            </p>

            {/* Requirements checklist */}
            <ul className="space-y-0.5 text-xs">
              <li
                className={
                  passwordChecks.length ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]"
                }
              >
                {passwordChecks.length ? "✓" : "○"} Mínimo 8 caracteres
              </li>
              <li
                className={
                  passwordChecks.uppercase
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-text-muted)]"
                }
              >
                {passwordChecks.uppercase ? "✓" : "○"} Uma letra maiúscula
              </li>
              <li
                className={
                  passwordChecks.number ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]"
                }
              >
                {passwordChecks.number ? "✓" : "○"} Um número
              </li>
            </ul>
          </div>
        )}
      </div>

      <Input
        name="confirmPassword"
        type="password"
        label="Confirmar Senha"
        placeholder="Repita sua senha"
        error={errors.confirmPassword}
        disabled={isLoading}
        showPasswordToggle
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button
        type="submit"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        Criar Conta
      </Button>
    </form>
  );
}
