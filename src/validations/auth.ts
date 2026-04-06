import { z } from "zod";

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, "Username deve ter pelo menos 3 caracteres")
    .max(50, "Username deve ter no máximo 50 caracteres")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username só pode conter letras, números, _ e -"
    ),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha muito longa")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
});

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
