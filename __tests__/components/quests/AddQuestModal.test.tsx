/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/actions/quests", () => ({
  createQuest: jest.fn(),
}));

import { AddQuestModal } from "@/components/quests/AddQuestModal";
import { createQuest } from "@/actions/quests";

const createQuestMock = createQuest as jest.MockedFunction<typeof createQuest>;

const mockGames = [
  { id: "22222222-0000-4000-8000-000000000001", title: "Hollow Knight" },
  { id: "22222222-0000-4000-8000-000000000002", title: "Elden Ring" },
];

describe("AddQuestModal", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renderiza com título 'Nova Quest' e lista de jogos disponíveis", () => {
    render(
      <AddQuestModal
        isOpen
        onClose={jest.fn()}
        games={mockGames}
        onCreated={jest.fn()}
      />
    );

    expect(
      screen.getByRole("heading", { name: /nova quest/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Hollow Knight")).toBeInTheDocument();
    expect(screen.getByText("Elden Ring")).toBeInTheDocument();
  });

  it("submete formulário e chama createQuest com FormData correto", async () => {
    const user = userEvent.setup();
    const onCreated = jest.fn();
    const onClose = jest.fn();

    createQuestMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: "q1",
        gameId: mockGames[0].id,
        title: "Derrotar Hornet",
        description: null,
        completed: false,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    render(
      <AddQuestModal
        isOpen
        onClose={onClose}
        games={mockGames}
        onCreated={onCreated}
      />
    );

    await user.selectOptions(
      screen.getByLabelText(/jogo vinculado/i),
      mockGames[0].id
    );
    await user.type(
      screen.getByLabelText(/nome da quest/i),
      "Derrotar Hornet"
    );
    await user.click(screen.getByRole("button", { name: /criar quest/i }));

    await waitFor(() => {
      expect(createQuestMock).toHaveBeenCalledTimes(1);
    });
    const fd = createQuestMock.mock.calls[0][0] as FormData;
    expect(fd.get("gameId")).toBe(mockGames[0].id);
    expect(fd.get("title")).toBe("Derrotar Hornet");
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("exibe fieldErrors quando o servidor rejeita", async () => {
    const user = userEvent.setup();
    createQuestMock.mockResolvedValueOnce({
      success: false,
      error: "Dados inválidos",
      fieldErrors: { title: ["Nome da quest é obrigatório"] },
    });

    render(
      <AddQuestModal
        isOpen
        onClose={jest.fn()}
        games={mockGames}
        onCreated={jest.fn()}
      />
    );

    await user.selectOptions(
      screen.getByLabelText(/jogo vinculado/i),
      mockGames[0].id
    );
    await user.type(screen.getByLabelText(/nome da quest/i), "X");
    await user.click(screen.getByRole("button", { name: /criar quest/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/nome da quest é obrigatório/i)
      ).toBeInTheDocument();
    });
  });
});
