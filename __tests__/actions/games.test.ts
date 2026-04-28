/**
 * @jest-environment node
 *
 * Testes da Server Action de games — banco mockado via makeDbMock.
 * Cobre: createGame, updateGame, deleteGame, toggleFavorite, getGames.
 */

import { makeDbMock, type DbMock } from "../utils/dbMock";
import { mockSession } from "../fixtures/session";
import { mockGame, mockTags } from "../fixtures/games";

// Mocks
jest.mock("@/lib/db", () => ({
  db: makeDbMock(),
}));
jest.mock("@/lib/session", () => ({
  getSession: jest.fn(),
}));

// Re-imports após o mock estar ativo
import { db as dbRaw } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  createGame,
  updateGame,
  deleteGame,
  toggleFavorite,
  getGames,
} from "@/actions/games";

const db = dbRaw as unknown as DbMock;
const getSessionMock = getSession as jest.MockedFunction<typeof getSession>;

beforeEach(() => {
  jest.resetAllMocks(); // limpa fila + implementações
  // Re-aplica encadeamento (cada método retorna o próprio mock)
  Object.values(db).forEach((fn) => (fn as jest.Mock).mockReturnValue(db));
  getSessionMock.mockResolvedValue(mockSession);
});

// ───────────────────────────────────────────────────────────
// createGame
// ───────────────────────────────────────────────────────────
describe("createGame", () => {
  function buildFormData(overrides: Partial<Record<string, string>> = {}) {
    const fd = new FormData();
    fd.set("title", "Hollow Knight");
    Object.entries(overrides).forEach(([k, v]) => {
      if (v != null) fd.set(k, v);
    });
    return fd;
  }

  it("cria um jogo com sucesso quando o título não existe", async () => {
    // Arrange
    db.limit.mockResolvedValueOnce([]); // sem duplicata
    db.returning.mockResolvedValueOnce([mockGame]); // insert retorna o jogo

    // Act
    const result = await createGame(buildFormData());

    // Assert
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("Hollow Knight");
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it("rejeita quando o título já existe (case-insensitive)", async () => {
    db.limit.mockResolvedValueOnce([{ id: "existing-id" }]); // duplicata encontrada

    const result = await createGame(buildFormData({ title: "Hollow Knight" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Jogo com este título já existe");
      expect(result.fieldErrors?.title).toBeDefined();
    }
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("retorna fieldErrors quando o título está vazio (validação Zod)", async () => {
    const fd = new FormData();
    fd.set("title", "");

    const result = await createGame(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Dados inválidos");
      expect(result.fieldErrors?.title).toBeDefined();
    }
  });

  it("aceita campos opcionais (rating, status, platformId, review)", async () => {
    db.limit.mockResolvedValueOnce([]);
    db.returning.mockResolvedValueOnce([
      { ...mockGame, rating: "4.5", status: "jogando" },
    ]);

    const result = await createGame(
      buildFormData({
        rating: "4.5",
        status: "jogando",
        review: "Excelente metroidvania",
      })
    );

    expect(result.success).toBe(true);
    expect(db.values).toHaveBeenCalledWith(
      expect.objectContaining({
        rating: "4.5",
        status: "jogando",
        review: "Excelente metroidvania",
      })
    );
  });

  it("lança erro quando o usuário não está autenticado", async () => {
    getSessionMock.mockResolvedValueOnce(null);

    await expect(createGame(buildFormData())).rejects.toThrow(
      "Não autenticado"
    );
  });
});

// ───────────────────────────────────────────────────────────
// updateGame
// ───────────────────────────────────────────────────────────
describe("updateGame", () => {
  it("atualiza com sucesso o jogo do próprio usuário", async () => {
    db.limit.mockResolvedValueOnce([mockGame]); // ownership check
    db.returning.mockResolvedValueOnce([{ ...mockGame, title: "Novo Título" }]);

    const fd = new FormData();
    fd.set("title", "Novo Título");

    const result = await updateGame(mockGame.id, fd);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("Novo Título");
    expect(db.update).toHaveBeenCalledTimes(1);
  });

  it("rejeita quando o jogo não pertence ao usuário", async () => {
    db.limit.mockResolvedValueOnce([]); // ownership check falha

    const fd = new FormData();
    fd.set("title", "Tentativa");

    const result = await updateGame("other-id", fd);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Jogo não encontrado");
    expect(db.update).not.toHaveBeenCalled();
  });

  it("rejeita renomeação para título já existente em outro jogo", async () => {
    db.limit
      .mockResolvedValueOnce([mockGame]) // ownership ok
      .mockResolvedValueOnce([{ id: "another-id" }]); // duplicata

    const fd = new FormData();
    fd.set("title", "Outro Jogo Existente");

    const result = await updateGame(mockGame.id, fd);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.title).toBeDefined();
  });
});

// ───────────────────────────────────────────────────────────
// deleteGame
// ───────────────────────────────────────────────────────────
describe("deleteGame", () => {
  it("deleta com sucesso o jogo do próprio usuário", async () => {
    db.limit.mockResolvedValueOnce([{ id: mockGame.id }]); // existe
    // delete().where() apenas é awaited; retornar o próprio chain (já está
    // configurado via beforeEach) é suficiente — o action ignora o retorno.

    const result = await deleteGame(mockGame.id);

    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalledTimes(1);
  });

  it("rejeita quando o jogo não existe ou não pertence ao usuário", async () => {
    db.limit.mockResolvedValueOnce([]);

    const result = await deleteGame("inexistente");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Jogo não encontrado");
    expect(db.delete).not.toHaveBeenCalled();
  });
});

// ───────────────────────────────────────────────────────────
// toggleFavorite
// ───────────────────────────────────────────────────────────
describe("toggleFavorite", () => {
  it("alterna de não-favorito para favorito", async () => {
    db.limit.mockResolvedValueOnce([
      { id: mockGame.id, isFavorite: false },
    ]);

    const result = await toggleFavorite(mockGame.id);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isFavorite).toBe(true);
    expect(db.set).toHaveBeenCalledWith(
      expect.objectContaining({ isFavorite: true })
    );
  });

  it("alterna de favorito para não-favorito", async () => {
    db.limit.mockResolvedValueOnce([{ id: mockGame.id, isFavorite: true }]);

    const result = await toggleFavorite(mockGame.id);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isFavorite).toBe(false);
  });

  it("rejeita quando o jogo não pertence ao usuário", async () => {
    db.limit.mockResolvedValueOnce([]);

    const result = await toggleFavorite("inexistente");

    expect(result.success).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────
// getGames
// ───────────────────────────────────────────────────────────
describe("getGames", () => {
  it("retorna lista vazia quando o usuário não tem jogos", async () => {
    // Single LEFT JOIN: terminal é orderBy
    db.orderBy.mockResolvedValueOnce([]);

    const result = await getGames();

    expect(result).toEqual([]);
  });

  it("retorna jogos com tags agrupadas corretamente (single LEFT JOIN)", async () => {
    // Linhas retornadas pelo LEFT JOIN (1 jogo × 1 tag = 1 linha aqui)
    db.orderBy.mockResolvedValueOnce([
      {
        id: mockGame.id,
        userId: mockGame.userId,
        title: mockGame.title,
        coverImageUrl: mockGame.coverImageUrl,
        isFavorite: mockGame.isFavorite,
        platformId: mockGame.platformId,
        rating: mockGame.rating,
        review: mockGame.review,
        status: mockGame.status,
        createdAt: mockGame.createdAt,
        updatedAt: mockGame.updatedAt,
        tagId: mockTags[0].id,
        tagName: mockTags[0].name,
        tagColor: mockTags[0].color,
        tagCreatedAt: mockTags[0].createdAt,
        tagUpdatedAt: mockTags[0].updatedAt,
      },
    ]);

    const result = await getGames();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(mockGame.id);
    expect(result[0].tags).toHaveLength(1);
    expect(result[0].tags[0].name).toBe("RPG");
  });

  it("agrupa múltiplas linhas do mesmo jogo (várias tags) em um único objeto", async () => {
    db.orderBy.mockResolvedValueOnce([
      {
        id: mockGame.id,
        userId: mockGame.userId,
        title: mockGame.title,
        coverImageUrl: mockGame.coverImageUrl,
        isFavorite: mockGame.isFavorite,
        platformId: mockGame.platformId,
        rating: mockGame.rating,
        review: mockGame.review,
        status: mockGame.status,
        createdAt: mockGame.createdAt,
        updatedAt: mockGame.updatedAt,
        tagId: mockTags[0].id,
        tagName: mockTags[0].name,
        tagColor: mockTags[0].color,
        tagCreatedAt: mockTags[0].createdAt,
        tagUpdatedAt: mockTags[0].updatedAt,
      },
      {
        id: mockGame.id,
        userId: mockGame.userId,
        title: mockGame.title,
        coverImageUrl: mockGame.coverImageUrl,
        isFavorite: mockGame.isFavorite,
        platformId: mockGame.platformId,
        rating: mockGame.rating,
        review: mockGame.review,
        status: mockGame.status,
        createdAt: mockGame.createdAt,
        updatedAt: mockGame.updatedAt,
        tagId: mockTags[1].id,
        tagName: mockTags[1].name,
        tagColor: mockTags[1].color,
        tagCreatedAt: mockTags[1].createdAt,
        tagUpdatedAt: mockTags[1].updatedAt,
      },
    ]);

    const result = await getGames();
    expect(result).toHaveLength(1);
    expect(result[0].tags).toHaveLength(2);
  });

  it("inclui jogos sem tags (LEFT JOIN com NULL nos campos de tag)", async () => {
    db.orderBy.mockResolvedValueOnce([
      {
        id: mockGame.id,
        userId: mockGame.userId,
        title: mockGame.title,
        coverImageUrl: mockGame.coverImageUrl,
        isFavorite: mockGame.isFavorite,
        platformId: mockGame.platformId,
        rating: mockGame.rating,
        review: mockGame.review,
        status: mockGame.status,
        createdAt: mockGame.createdAt,
        updatedAt: mockGame.updatedAt,
        tagId: null,
        tagName: null,
        tagColor: null,
        tagCreatedAt: null,
        tagUpdatedAt: null,
      },
    ]);

    const result = await getGames();
    expect(result).toHaveLength(1);
    expect(result[0].tags).toEqual([]);
  });
});
