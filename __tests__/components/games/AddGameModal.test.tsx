/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/library",
}));

jest.mock("@/actions/games", () => ({
  createGame: jest.fn(),
}));

jest.mock("@/stores/useAppStore", () => {
  const addGameFn = jest.fn();
  const platforms = [
    {
      id: "33333333-0000-0000-0000-000000000001",
      userId: "user-id",
      name: "PC",
      color: "#5E81AC",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  return {
    __mocks: { addGame: addGameFn },
    useAppStore: <T,>(
      selector: (s: { platforms: typeof platforms; addGame: typeof addGameFn }) => T
    ) => selector({ platforms, addGame: addGameFn }),
  };
});

// Imports após os mocks
import { AddGameModal } from "@/components/games/AddGameModal";
import { createGame } from "@/actions/games";
import toast from "react-hot-toast";

// Recupera o mock do addGame exposto pelo factory acima
const storeMock = jest.requireMock("@/stores/useAppStore") as {
  __mocks: { addGame: jest.Mock };
};
const mockAddGameStore = storeMock.__mocks.addGame;

const createGameMock = createGame as jest.MockedFunction<typeof createGame>;

describe("AddGameModal", () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza o título 'Novo Jogo' quando aberto", () => {
    // Arrange + Act
    render(<AddGameModal isOpen onClose={onCloseMock} />);

    // Assert
    expect(
      screen.getByRole("heading", { name: /novo jogo/i })
    ).toBeInTheDocument();
  });

  it("submete o formulário e chama createGame com o título", async () => {
    // Arrange
    const user = userEvent.setup();
    createGameMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: "new-id",
        userId: "user-id",
        title: "Hollow Knight",
        coverImageUrl: null,
        isFavorite: false,
        platformId: null,
        rating: null,
        review: null,
        status: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    render(<AddGameModal isOpen onClose={onCloseMock} />);

    // Act
    await user.type(
      screen.getByLabelText(/título do jogo/i),
      "Hollow Knight"
    );
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    // Assert
    await waitFor(() => {
      expect(createGameMock).toHaveBeenCalledTimes(1);
    });
    const formData = createGameMock.mock.calls[0][0] as FormData;
    expect(formData.get("title")).toBe("Hollow Knight");
    expect(toast.success).toHaveBeenCalledWith("Jogo adicionado!");
    expect(mockAddGameStore).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("exibe erro de campo quando o servidor retorna fieldErrors", async () => {
    // Arrange
    const user = userEvent.setup();
    createGameMock.mockResolvedValueOnce({
      success: false,
      error: "Dados inválidos",
      fieldErrors: { title: ["Jogo com este título já existe"] },
    });

    render(<AddGameModal isOpen onClose={onCloseMock} />);

    // Act
    await user.type(
      screen.getByLabelText(/título do jogo/i),
      "Duplicado"
    );
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText(/jogo com este título já existe/i)
      ).toBeInTheDocument();
    });
    expect(mockAddGameStore).not.toHaveBeenCalled();
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it("inclui rating no FormData quando o usuário seleciona estrelas", async () => {
    // Arrange
    const user = userEvent.setup();
    createGameMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: "new-id",
        userId: "user-id",
        title: "Stardew Valley",
        coverImageUrl: null,
        isFavorite: false,
        platformId: null,
        rating: "4.5",
        review: null,
        status: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    render(<AddGameModal isOpen onClose={onCloseMock} />);

    // Act
    await user.type(
      screen.getByLabelText(/título do jogo/i),
      "Stardew Valley"
    );
    // Clica na 5ª estrela (botão "5 estrelas")
    await user.click(screen.getByRole("button", { name: /^5 estrelas$/i }));
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    // Assert
    await waitFor(() => {
      expect(createGameMock).toHaveBeenCalledTimes(1);
    });
    const formData = createGameMock.mock.calls[0][0] as FormData;
    expect(formData.get("rating")).toBe("5");
  });
});
