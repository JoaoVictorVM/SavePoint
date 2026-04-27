import "@testing-library/jest-dom";

// Setup específico do ambiente jsdom (componentes/UI).
// Em testes de actions (env: node), document/window não existem — pulamos.
const isJsdom = typeof window !== "undefined" && typeof document !== "undefined";

if (isJsdom) {
  // <dialog> polyfill — JSDOM não implementa showModal()/close()
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dialogPolyfill = require("dialog-polyfill") as {
    registerDialog: (el: HTMLDialogElement) => void;
  };

  const originalCreateElement = document.createElement.bind(document);
  document.createElement = (
    tagName: string,
    options?: ElementCreationOptions
  ) => {
    const el = originalCreateElement(tagName, options);
    if (tagName.toLowerCase() === "dialog") {
      dialogPolyfill.registerDialog(el as HTMLDialogElement);
    }
    return el;
  };

  // ResizeObserver — exigido pelo Recharts/JSDOM
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (
    globalThis as unknown as { ResizeObserver: typeof ResizeObserverMock }
  ).ResizeObserver = ResizeObserverMock;

  // matchMedia — alguns componentes podem usar
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
}

// Silencia warnings de act() em fluxos assíncronos esperados
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (
      typeof first === "string" &&
      (first.includes("not wrapped in act") ||
        first.includes("ReactDOMTestUtils.act"))
    ) {
      return;
    }
    originalError(...(args as Parameters<typeof originalError>));
  };
});
afterAll(() => {
  console.error = originalError;
});
