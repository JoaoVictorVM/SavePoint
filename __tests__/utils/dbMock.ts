/**
 * Helper para mockar o objeto `db` do Drizzle.
 * Todos os métodos retornam o próprio mock (chain), exceto os terminais
 * (limit, returning, orderBy quando awaited diretamente) que devem ser
 * configurados via mockResolvedValueOnce em cada teste.
 */
export function makeDbMock() {
  const db: Record<string, jest.Mock> = {};
  const methods = [
    "select",
    "from",
    "where",
    "limit",
    "orderBy",
    "innerJoin",
    "leftJoin",
    "insert",
    "values",
    "returning",
    "update",
    "set",
    "delete",
    "transaction",
  ];
  methods.forEach((m) => {
    db[m] = jest.fn().mockReturnValue(db);
  });
  return db;
}

export type DbMock = ReturnType<typeof makeDbMock>;
