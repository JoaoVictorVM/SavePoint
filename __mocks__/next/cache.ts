// Mock global do next/cache.
// - unstable_cache: bypassa o cache, executa a função diretamente.
// - revalidateTag/revalidatePath: noop (apenas registra a chamada).
export const unstable_cache = <
  TArgs extends unknown[],
  TReturn,
>(
  fn: (...args: TArgs) => Promise<TReturn> | TReturn,
  _keyParts?: string[],
  _options?: unknown
): ((...args: TArgs) => Promise<TReturn>) => {
  return async (...args: TArgs) => fn(...args);
};

export const revalidateTag = jest.fn();
export const revalidatePath = jest.fn();
export const updateTag = jest.fn();
