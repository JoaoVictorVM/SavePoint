/**
 * @jest-environment node
 */
import { makeDbMock, type DbMock } from "../utils/dbMock";
import { mockSession } from "../fixtures/session";

jest.mock("@/lib/db", () => ({ db: makeDbMock() }));
jest.mock("@/lib/session", () => ({ getSession: jest.fn() }));

import { db as dbRaw } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  getJourneyData,
  addGamesToJourney,
  removeFromJourney,
  moveJourneyItem,
} from "@/actions/journey";

const db = dbRaw as unknown as DbMock;
const getSessionMock = getSession as jest.MockedFunction<typeof getSession>;

beforeEach(() => {
  jest.resetAllMocks();
  Object.values(db).forEach((fn) => (fn as jest.Mock).mockReturnValue(db));
  getSessionMock.mockResolvedValue(mockSession);
});

describe("getJourneyData", () => {
  it("retorna estrutura vazia quando não há itens", async () => {
    db.orderBy.mockResolvedValueOnce([]);
    const result = await getJourneyData();
    // Todas as 5 colunas devem existir e estar vazias
    expect(Object.keys(result).length).toBeGreaterThanOrEqual(5);
    Object.values(result).forEach((col) => expect(col).toEqual([]));
  });

  it("agrupa itens por coluna corretamente", async () => {
    db.orderBy.mockResolvedValueOnce([
      {
        journeyItemId: "j1",
        gameId: "g1",
        column: "para_jogar",
        position: 0,
        title: "Hollow Knight",
        coverImageUrl: null,
      },
    ]);
    // 1ª where (userGames) → chain; 2ª where (tags fetch) → terminal []
    db.where.mockReturnValueOnce(db).mockResolvedValueOnce([]);

    const result = await getJourneyData();

    expect(result.para_jogar).toHaveLength(1);
    expect(result.para_jogar[0].title).toBe("Hollow Knight");
  });
});

describe("addGamesToJourney", () => {
  it("adiciona jogos à coluna especificada", async () => {
    // 1. ownership check
    db.where.mockResolvedValueOnce([
      { id: "g1", title: "Hollow Knight", coverImageUrl: null },
    ]);
    // 2. max position lookup (innerJoin → where)
    db.where.mockResolvedValueOnce([{ maxPosition: -1 }]);
    // 3. insert returning
    db.returning.mockResolvedValueOnce([
      { id: "j1", gameId: "g1", column: "para_jogar", position: 0 },
    ]);
    // 4. tags fetch
    db.where.mockResolvedValueOnce([]);

    const result = await addGamesToJourney(["g1"], "para_jogar");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].gameId).toBe("g1");
    }
  });

  it("rejeita quando nenhum jogo é selecionado", async () => {
    const result = await addGamesToJourney([], "para_jogar");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Nenhum jogo selecionado");
  });

  it("rejeita coluna inválida", async () => {
    const result = await addGamesToJourney(
      ["g1"],
      "invalida" as never
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Coluna inválida");
  });

  it("rejeita quando algum jogo não pertence ao usuário", async () => {
    db.where.mockResolvedValueOnce([]); // ownership não retorna ninguém
    const result = await addGamesToJourney(["g1", "g2"], "para_jogar");
    expect(result.success).toBe(false);
  });
});

describe("removeFromJourney", () => {
  it("remove item do próprio usuário", async () => {
    db.limit.mockResolvedValueOnce([{ id: "j1" }]);

    const result = await removeFromJourney("j1");

    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalledTimes(1);
  });

  it("rejeita item de outro usuário", async () => {
    db.limit.mockResolvedValueOnce([]);
    const result = await removeFromJourney("j1");
    expect(result.success).toBe(false);
  });
});

describe("moveJourneyItem", () => {
  it("move o item para outra coluna/posição com sucesso", async () => {
    db.limit.mockResolvedValueOnce([
      { id: "j1", column: "para_jogar", position: 0 },
    ]);

    const result = await moveJourneyItem("j1", "zerado", 2);

    expect(result.success).toBe(true);
    expect(db.update).toHaveBeenCalledTimes(1);
    expect(db.set).toHaveBeenCalledWith(
      expect.objectContaining({ column: "zerado", position: 2 })
    );
  });

  it("rejeita coluna inválida", async () => {
    const result = await moveJourneyItem("j1", "x" as never, 0);
    expect(result.success).toBe(false);
  });

  it("rejeita item inexistente", async () => {
    db.limit.mockResolvedValueOnce([]);
    const result = await moveJourneyItem("nope", "para_jogar", 0);
    expect(result.success).toBe(false);
  });
});
