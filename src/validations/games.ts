import { z } from "zod";
import { GAME_STATUSES } from "@/lib/game-constants";

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
  platformId: z.string().uuid().optional().or(z.literal("")),
  rating: z
    .number()
    .min(0, "Nota mínima é 0")
    .max(5, "Nota máxima é 5")
    .multipleOf(0.5, "Nota deve ser em incrementos de 0.5")
    .optional()
    .nullable(),
  review: z
    .string()
    .max(5000, "Review deve ter no máximo 5000 caracteres")
    .optional()
    .or(z.literal("")),
  status: z.enum(GAME_STATUSES).optional().or(z.literal("")),
});

export const UpdateGameSchema = CreateGameSchema.partial().extend({
  isFavorite: z.boolean().optional(),
});

export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type UpdateGameInput = z.infer<typeof UpdateGameSchema>;
