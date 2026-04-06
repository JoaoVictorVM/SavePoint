import { z } from "zod";

export const CreateGameSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título deve ter no máximo 200 caracteres")
    .trim(),
  coverImageUrl: z
    .string()
    .url("URL de imagem inválida")
    .optional()
    .or(z.literal("")),
});

export const UpdateGameSchema = CreateGameSchema.partial().extend({
  isFavorite: z.boolean().optional(),
});

export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type UpdateGameInput = z.infer<typeof UpdateGameSchema>;
