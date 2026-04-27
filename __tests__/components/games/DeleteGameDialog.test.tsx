/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/actions/games", () => ({
  deleteGame: jest.fn(),
}));

jest.mock("@/stores/useAppStore", () => {
  const removeGameFn = jest.fn();
  return {
    __mocks: { removeGame: removeGameFn },
    useAppStore: <T,>(selector: (s: { removeGame: typeof removeGameFn }) => T) =>
      selector({ removeGame: removeGameFn }),
  };
});

import { DeleteGameDialog } from "@/components/games/DeleteGameDialog";
import { deleteGame } from "@/actions/games";
import toast from "react-hot-toast";

const deleteGameMock = deleteGame as jest.MockedFunction<typeof deleteGame>;
const storeMock = jest.requireMock("@/stores/useAppStore") as {
  __mocks: { removeGame: jest.Mock };
};

describe("DeleteGameDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza confirmação com o título do jogo", () => {
    render(
      <DeleteGameDialog
        gameId="game-1"
        gameTitle="Hollow Knight"
        questCount={0}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText(/tem certeza que deseja deletar/i)).toBeInTheDocument();
    expect(screen.getByText(/hollow knight/i)).toBeInTheDocument();
  });

  it("exibe aviso de perda de quests quando questCount > 0", () => {
    render(
      <DeleteGameDialog
        gameId="game-1"
        gameTitle="Hollow Knight"
        questCount={5}
        onClose={jest.fn()}
      />
    );

    expect(
      screen.getByText(/este jogo tem 5 quests/i)
    ).toBeInTheDocument();
  });

  it("chama deleteGame ao clicar em Deletar e fecha em sucesso", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    deleteGameMock.mockResolvedValueOnce({ success: true, data: undefined });

    render(
      <DeleteGameDialog
        gameId="game-1"
        gameTitle="Hollow Knight"
        questCount={0}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole("button", { name: /^deletar$/i }));

    await waitFor(() => {
      expect(deleteGameMock).toHaveBeenCalledWith("game-1");
    });
    expect(storeMock.__mocks.removeGame).toHaveBeenCalledWith("game-1");
    expect(toast.success).toHaveBeenCalledWith("Jogo removido!");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("não chama action ao clicar em Cancelar", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <DeleteGameDialog
        gameId="game-1"
        gameTitle="Hollow Knight"
        questCount={0}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(deleteGameMock).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("não renderiza quando gameId é null", () => {
    const { container } = render(
      <DeleteGameDialog
        gameId={null}
        gameTitle=""
        questCount={0}
        onClose={jest.fn()}
      />
    );
    expect(container.querySelector("dialog")).toBeNull();
  });
});
