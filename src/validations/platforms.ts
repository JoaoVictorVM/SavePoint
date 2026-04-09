import { z } from "zod";

export const CreatePlatformSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .trim(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um hex válido (ex: #06E09B)"),
});

export const UpdatePlatformSchema = CreatePlatformSchema.partial();

export type CreatePlatformInput = z.infer<typeof CreatePlatformSchema>;
export type UpdatePlatformInput = z.infer<typeof UpdatePlatformSchema>;
