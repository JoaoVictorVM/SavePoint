/**
 * @jest-environment node
 */
import { makeDbMock, type DbMock } from "../utils/dbMock";
import { mockSession } from "../fixtures/session";

jest.mock("@/lib/db", () => ({ db: makeDbMock() }));
jest.mock("@/lib/session", () => ({
  getSession: jest.fn(),
  updateSessionGold: jest.fn(),
}));

import { db as dbRaw } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  createQuest,
  updateQuest,
  toggleQuestComplete,
  deleteQuest,
  getQuestsGroupedByGame,
} from "@/actions/quests";

const db = dbRaw as unknown as DbMock;
const getSessionMock = getSession as jest.MockedFunction<typeof getSession>;

const mockQuest = {
  id: "quest-1",
  gameId: "22222222-0000-4000-8000-000000000001",
  title: "Derrotar Hornet",
  description: "Boss opcional",
  completed: false,
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.resetAllMocks();
  Object.values(db).forEach((fn) => (fn as jest.Mock).mockReturnValue(db));
  // db.transaction precisa invocar o callback com tx ≈ db
  (db.transaction as jest.Mock).mockImplementation(
    async (cb: (tx: DbMock) => Promise<unknown>) => cb(db)
  );
  getSessionMock.mockResolvedValue(mockSession);
});

function buildFormData(fields: Record<string, string>) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

// ───────────────────────────────────────────────
describe("createQuest", () => {
  it("cria quest com sucesso quando o jogo pertence ao usuário", async () => {
    db.limit.mockResolvedValueOnce([{ id: "22222222-0000-4000-8000-000000000001" }]); // game ownership
    db.returning.mockResolvedValueOnce([mockQuest]);

    const result = await createQuest(
      buildFormData({ gameId: "22222222-0000-4000-8000-000000000001", title: "Derrotar Hornet" })
    );

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it("rejeita quando o jogo não pertence ao usuário", async () => {
    db.limit.mockResolvedValueOnce([]);

    const result = await createQuest(
      buildFormData({ gameId: "22222222-0000-4000-8000-000000000002", title: "Quest" })
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Jogo não encontrado");
  });

  it("rejeita título vazio (Zod)", async () => {
    const result = await createQuest(
      buildFormData({ gameId: "22222222-0000-4000-8000-000000000001", title: "" })
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.title).toBeDefined();
  });
});

// ───────────────────────────────────────────────
describe("updateQuest", () => {
  it("atualiza quest não-concluída com sucesso", async () => {
    db.limit.mockResolvedValueOnce([{ ...mockQuest, completed: false }]);
    db.returning.mockResolvedValueOnce([
      { ...mockQuest, title: "Novo título" },
    ]);

    const result = await updateQuest(
      "quest-1",
      buildFormData({ title: "Novo título" })
    );

    expect(result.success).toBe(true);
  });

  it("rejeita edição de quest concluída", async () => {
    db.limit.mockResolvedValueOnce([{ ...mockQuest, completed: true }]);

    const result = await updateQuest(
      "quest-1",
      buildFormData({ title: "X" })
    );

    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error).toBe("Quest concluída não pode ser editada");
  });
});

// ───────────────────────────────────────────────
describe("toggleQuestComplete", () => {
  it("marca quest como concluída e incrementa gold em +1", async () => {
    // Ownership check (verifyQuestOwnership)
    db.limit.mockResolvedValueOnce([{ ...mockQuest, completed: false }]);
    // Dentro da transaction:
    db.returning.mockResolvedValueOnce([{ ...mockQuest, completed: true }]);
    db.limit.mockResolvedValueOnce([{ goldBalance: 11 }]);

    const result = await toggleQuestComplete("quest-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quest.completed).toBe(true);
      expect(result.data.newGoldBalance).toBe(11);
    }
    // Confirma que gold incrementou em +1 via expressão SQL
    expect(db.set).toHaveBeenCalledWith(
      expect.objectContaining({
        goldBalance: expect.anything(),
      })
    );
  });

  it("desmarca quest e decrementa gold em -1", async () => {
    db.limit.mockResolvedValueOnce([{ ...mockQuest, completed: true }]);
    db.returning.mockResolvedValueOnce([{ ...mockQuest, completed: false }]);
    db.limit.mockResolvedValueOnce([{ goldBalance: 9 }]);

    const result = await toggleQuestComplete("quest-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quest.completed).toBe(false);
      expect(result.data.newGoldBalance).toBe(9);
    }
  });

  it("rejeita quest de outro usuário", async () => {
    db.limit.mockResolvedValueOnce([]);
    const result = await toggleQuestComplete("alheia");
    expect(result.success).toBe(false);
  });
});

// ───────────────────────────────────────────────
describe("deleteQuest", () => {
  it("deleta quest não-concluída sem mexer no gold", async () => {
    db.limit.mockResolvedValueOnce([{ ...mockQuest, completed: false }]);

    const result = await deleteQuest("quest-1");

    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalledTimes(1);
    // Não deve chamar transaction quando quest não está concluída
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("deleta quest concluída e decrementa gold em -1 (transação)", async () => {
    db.limit.mockResolvedValueOnce([{ ...mockQuest, completed: true }]);
    // Após delete na transaction, faz select gold
    db.limit.mockResolvedValueOnce([{ goldBalance: 9 }]);

    const result = await deleteQuest("quest-1");

    expect(result.success).toBe(true);
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });

  it("rejeita quest inexistente", async () => {
    db.limit.mockResolvedValueOnce([]);
    const result = await deleteQuest("nope");
    expect(result.success).toBe(false);
  });
});

// ───────────────────────────────────────────────
describe("getQuestsGroupedByGame", () => {
  it("agrupa quests por jogo", async () => {
    db.orderBy.mockResolvedValueOnce([
      { quest: mockQuest, gameTitle: "Hollow Knight" },
      {
        quest: { ...mockQuest, id: "quest-2", title: "Outra" },
        gameTitle: "Hollow Knight",
      },
    ]);

    const result = await getQuestsGroupedByGame();

    expect(result).toHaveLength(1);
    expect(result[0].game.title).toBe("Hollow Knight");
    expect(result[0].quests).toHaveLength(2);
  });

  it("retorna array vazio quando não há quests", async () => {
    db.orderBy.mockResolvedValueOnce([]);
    const result = await getQuestsGroupedByGame();
    expect(result).toEqual([]);
  });
});
