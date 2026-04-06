import { z } from "zod";

export const CreateQuestSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título deve ter no máximo 200 caracteres")
    .trim(),
  description: z
    .string()
    .max(2000, "Descrição deve ter no máximo 2000 caracteres")
    .optional(),
  progressMax: z
    .number()
    .int("Progresso máximo deve ser um número inteiro")
    .min(1, "Progresso máximo deve ser pelo menos 1")
    .max(9999, "Progresso máximo deve ser no máximo 9999"),
  goldReward: z
    .number()
    .min(0, "Recompensa não pode ser negativa")
    .max(99999.99, "Recompensa muito alta")
    .multipleOf(0.01, "Recompensa deve ter no máximo 2 casas decimais"),
});

export const UpdateQuestSchema = CreateQuestSchema.partial();

export const UpdateProgressSchema = z.object({
  progress: z
    .number()
    .int("Progresso deve ser um número inteiro")
    .min(0, "Progresso não pode ser negativo"),
});

export type CreateQuestInput = z.infer<typeof CreateQuestSchema>;
export type UpdateQuestInput = z.infer<typeof UpdateQuestSchema>;
export type UpdateProgressInput = z.infer<typeof UpdateProgressSchema>;
