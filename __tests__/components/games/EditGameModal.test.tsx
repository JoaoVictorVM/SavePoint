/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/library",
}));

jest.mock("@/actions/games", () => ({
  updateGame: jest.fn(),
}));

jest.mock("@/stores/useAppStore", () => {
  const updateGameFn = jest.fn();
  return {
    __mocks: { updateGame: updateGameFn },
    useAppStore: <T,>(
      selector: (s: { platforms: never[]; updateGame: typeof updateGameFn }) => T
    ) => selector({ platforms: [], updateGame: updateGameFn }),
  };
});

import { EditGameModal } from "@/components/games/EditGameModal";
import { updateGame } from "@/actions/games";
import type { GameWithTags } from "@/lib/types";

const updateGameMock = updateGame as jest.MockedFunction<typeof updateGame>;
const storeMock = jest.requireMock("@/stores/useAppStore") as {
  __mocks: { updateGame: jest.Mock };
};

const mockGame: GameWithTags = {
  id: "game-1",
  userId: "user-1",
  title: "Hollow Knight",
  coverImageUrl: "https://example.com/hk.jpg",
  isFavorite: false,
  platformId: null,
  rating: "4.5",
  review: "Excelente",
  status: "jogando",
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [],
};

describe("EditGameModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("preenche os campos com os dados do jogo existente", async () => {
    // Arrange + Act
    render(<EditGameModal game={mockGame} onClose={jest.fn()} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByLabelText(/título do jogo/i)).toHaveValue(
        "Hollow Knight"
      );
    });
    expect(screen.getByLabelText(/url da capa/i)).toHaveValue(
      "https://example.com/hk.jpg"
    );
    expect(screen.getByLabelText(/review/i)).toHaveValue("Excelente");
  });

  it("submete a edição e chama updateGame com o novo título", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = jest.fn();
    updateGameMock.mockResolvedValueOnce({
      success: true,
      data: { ...mockGame, title: "Hollow Knight: Silksong" },
    });

    render(<EditGameModal game={mockGame} onClose={onClose} />);

    // Act
    const titleInput = screen.getByLabelText(/título do jogo/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Hollow Knight: Silksong");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    // Assert
    await waitFor(() => {
      expect(updateGameMock).toHaveBeenCalledWith(
        "game-1",
        expect.any(FormData)
      );
    });
    const formData = updateGameMock.mock.calls[0][1];
    expect(formData.get("title")).toBe("Hollow Knight: Silksong");
    expect(storeMock.__mocks.updateGame).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("não renderiza quando game é null", () => {
    const { container } = render(
      <EditGameModal game={null} onClose={jest.fn()} />
    );
    expect(container.querySelector("dialog")).toBeNull();
  });
});
