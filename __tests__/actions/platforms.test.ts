/**
 * @jest-environment node
 */
import { makeDbMock, type DbMock } from "../utils/dbMock";
import { mockSession } from "../fixtures/session";
import { mockPlatforms } from "../fixtures/platforms";

jest.mock("@/lib/db", () => ({ db: makeDbMock() }));
jest.mock("@/lib/session", () => ({ getSession: jest.fn() }));

import { db as dbRaw } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  getUserPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
} from "@/actions/platforms";

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

describe("getUserPlatforms", () => {
  it("retorna plataformas do usuário", async () => {
    db.orderBy.mockResolvedValueOnce(mockPlatforms);
    const result = await getUserPlatforms();
    expect(result).toEqual(mockPlatforms);
  });
});

describe("createPlatform", () => {
  it("cria plataforma com sucesso", async () => {
    db.limit.mockResolvedValueOnce([]);
    db.returning.mockResolvedValueOnce([mockPlatforms[0]]);

    const result = await createPlatform(
      buildFormData({ name: "PC", color: "#5E81AC" })
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("PC");
  });

  it("rejeita nome duplicado", async () => {
    db.limit.mockResolvedValueOnce([{ id: "x" }]);
    const result = await createPlatform(
      buildFormData({ name: "PC", color: "#5E81AC" })
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.name).toBeDefined();
  });

  it("retorna fieldErrors com cor inválida", async () => {
    const result = await createPlatform(
      buildFormData({ name: "PC", color: "azul" })
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.color).toBeDefined();
  });
});

describe("updatePlatform", () => {
  it("atualiza com sucesso", async () => {
    db.limit.mockResolvedValueOnce([mockPlatforms[0]]);
    db.returning.mockResolvedValueOnce([
      { ...mockPlatforms[0], name: "Steam Deck" },
    ]);

    const result = await updatePlatform(
      mockPlatforms[0].id,
      buildFormData({ name: "Steam Deck", color: "#5E81AC" })
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Steam Deck");
  });

  it("rejeita quando plataforma não pertence ao usuário", async () => {
    db.limit.mockResolvedValueOnce([]);
    const result = await updatePlatform(
      "outra",
      buildFormData({ name: "X", color: "#FFFFFF" })
    );
    expect(result.success).toBe(false);
  });
});

describe("deletePlatform", () => {
  it("deleta plataforma do próprio usuário", async () => {
    db.limit.mockResolvedValueOnce([{ id: mockPlatforms[0].id }]);
    const result = await deletePlatform(mockPlatforms[0].id);
    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalledTimes(1);
  });

  it("rejeita quando plataforma não existe", async () => {
    db.limit.mockResolvedValueOnce([]);
    const result = await deletePlatform("inexistente");
    expect(result.success).toBe(false);
  });
});
