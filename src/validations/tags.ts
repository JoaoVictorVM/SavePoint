import { z } from "zod";

export const CreateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .trim(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um hex válido (ex: #06E09B)"),
});

export const UpdateTagSchema = CreateTagSchema.partial();

export const AssignTagSchema = z.object({
  gameId: z.string().uuid("ID de jogo inválido"),
  tagId: z.string().uuid("ID de tag inválido"),
});

export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;
export type AssignTagInput = z.infer<typeof AssignTagSchema>;
