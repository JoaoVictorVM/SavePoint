"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginUser } from "@/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setGlobalError("");

    const formData = new FormData(e.currentTarget);

    const result = await loginUser(formData);

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
        <div className="bg-[#FF453A]/10 border border-[#FF453A]/30 rounded-[16px] px-4 py-3 text-sm text-[#FF453A]">
          {globalError}
        </div>
      )}

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="seu@email.com"
        error={errors.email}
        disabled={isLoading}
        required
      />

      <Input
        name="password"
        type="password"
        label="Senha"
        placeholder="Sua senha"
        error={errors.password}
        disabled={isLoading}
        showPasswordToggle
        required
      />

      <Button
        type="submit"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        Entrar
      </Button>
    </form>
  );
}
