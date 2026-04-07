import { z } from "zod";

export const CreateQuestSchema = z.object({
  gameId: z.string().uuid("Jogo é obrigatório"),
  title: z
    .string()
    .min(1, "Nome da quest é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres")
    .trim(),
  description: z
    .string()
    .max(2000, "Descrição deve ter no máximo 2000 caracteres")
    .optional(),
});

export const UpdateQuestSchema = z.object({
  title: z
    .string()
    .min(1, "Nome da quest é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres")
    .trim(),
  description: z
    .string()
    .max(2000, "Descrição deve ter no máximo 2000 caracteres")
    .optional(),
});

export type CreateQuestInput = z.infer<typeof CreateQuestSchema>;
export type UpdateQuestInput = z.infer<typeof UpdateQuestSchema>;
