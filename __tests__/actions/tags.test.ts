/**
 * @jest-environment node
 */
import { makeDbMock, type DbMock } from "../utils/dbMock";
import { mockSession } from "../fixtures/session";
import { mockTags } from "../fixtures/games";

jest.mock("@/lib/db", () => ({ db: makeDbMock() }));
jest.mock("@/lib/session", () => ({ getSession: jest.fn() }));

import { db as dbRaw } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  getUserTags,
  createTag,
  updateTag,
  deleteTag,
  assignTagToGame,
  removeTagFromGame,
} from "@/actions/tags";

const db = dbRaw as unknown as DbMock;
const getSessionMock = getSession as jest.MockedFunction<typeof getSession>;

beforeEach(() => {
  jest.resetAllMocks();
  Object.values(db).forEach((fn) => (fn as jest.Mock).mockReturnValue(db));
  getSessionMock.mockResolvedValue(mockSession);
});

function buildFormData(fields: Record<string, string>) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

// ───────────────────────────────────────────────
describe("getUserTags", () => {
  it("retorna todas as tags do usuário ordenadas por createdAt", async () => {
    db.orderBy.mockResolvedValueOnce(mockTags);

    const result = await getUserTags();

    expect(result).toEqual(mockTags);
    expect(db.select).toHaveBeenCalledTimes(1);
  });
});

// ───────────────────────────────────────────────
describe("createTag", () => {
  it("cria uma tag com sucesso quando o nome é único", async () => {
    db.limit.mockResolvedValueOnce([]); // sem duplicata
    db.returning.mockResolvedValueOnce([mockTags[0]]);

    const result = await createTag(
      buildFormData({ name: "RPG", color: "#88C0D0" })
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("RPG");
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it("rejeita quando a tag com o mesmo nome já existe", async () => {
    db.limit.mockResolvedValueOnce([{ id: "exists" }]);

    const result = await createTag(
      buildFormData({ name: "RPG", color: "#88C0D0" })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Tag com este nome já existe");
      expect(result.fieldErrors?.name).toBeDefined();
    }
  });

  it("retorna fieldErrors com cor inválida (Zod)", async () => {
    const result = await createTag(
      buildFormData({ name: "Tag", color: "não-é-hex" })
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.color).toBeDefined();
  });
});

// ───────────────────────────────────────────────
describe("updateTag", () => {
  it("atualiza tag do próprio usuário com sucesso", async () => {
    db.limit.mockResolvedValueOnce([mockTags[0]]); // ownership
    db.returning.mockResolvedValueOnce([{ ...mockTags[0], name: "Indie" }]);

    const result = await updateTag(
      mockTags[0].id,
      buildFormData({ name: "Indie", color: "#A3BE8C" })
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Indie");
  });

  it("rejeita quando a tag não pertence ao usuário", async () => {
    db.limit.mockResolvedValueOnce([]);

    const result = await updateTag(
      "outro",
      buildFormData({ name: "X", color: "#AAAAAA" })
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Tag não encontrada");
  });
});

// ───────────────────────────────────────────────
describe("deleteTag", () => {
  it("deleta com sucesso e retorna jogos afetados", async () => {
    db.limit.mockResolvedValueOnce([{ id: mockTags[0].id }]); // ownership
    db.where.mockReturnValueOnce(db); // ownership chain inicial
    // count
    db.where.mockResolvedValueOnce([{ count: 3 }]);

    const result = await deleteTag(mockTags[0].id);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.affectedGames).toBe(3);
    expect(db.delete).toHaveBeenCalledTimes(1);
  });

  it("rejeita quando a tag não existe", async () => {
    db.limit.mockResolvedValueOnce([]);

    const result = await deleteTag("inexistente");

    expect(result.success).toBe(false);
  });
});

// ───────────────────────────────────────────────
describe("assignTagToGame", () => {
  it("atribui tag ao jogo quando dentro do limite (5)", async () => {
    db.limit
      .mockResolvedValueOnce([{ id: mockTags[0].id }]) // tag ownership
      .mockResolvedValueOnce([]); // not yet assigned
    // count tags on game
    db.where.mockReturnValueOnce(db); // tag ownership chain
    db.where.mockResolvedValueOnce([{ count: 2 }]); // count = 2

    const result = await assignTagToGame("game-1", mockTags[0].id);

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it("rejeita quando o jogo já tem 5 tags", async () => {
    db.limit.mockResolvedValueOnce([{ id: mockTags[0].id }]); // ownership ok
    db.where.mockReturnValueOnce(db);
    db.where.mockResolvedValueOnce([{ count: 5 }]);

    const result = await assignTagToGame("game-1", mockTags[0].id);

    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error).toBe("Máximo de 5 tags por jogo atingido");
  });

  it("rejeita quando a tag não pertence ao usuário", async () => {
    db.limit.mockResolvedValueOnce([]); // ownership falha

    const result = await assignTagToGame("game-1", "outra-tag");

    expect(result.success).toBe(false);
  });
});

// ───────────────────────────────────────────────
describe("removeTagFromGame", () => {
  it("remove a tag do jogo com sucesso", async () => {
    const result = await removeTagFromGame("game-1", mockTags[0].id);
    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalledTimes(1);
  });
});
