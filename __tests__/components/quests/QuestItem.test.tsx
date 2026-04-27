/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/actions/quests", () => ({
  toggleQuestComplete: jest.fn(),
  deleteQuest: jest.fn(),
}));

import { QuestItem } from "@/components/quests/QuestItem";
import { toggleQuestComplete, deleteQuest } from "@/actions/quests";

const toggleMock = toggleQuestComplete as jest.MockedFunction<
  typeof toggleQuestComplete
>;
const deleteMock = deleteQuest as jest.MockedFunction<typeof deleteQuest>;

const baseQuest = {
  id: "q1",
  gameId: "g1",
  title: "Derrotar Hornet",
  description: "Boss opcional",
  completed: false,
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("QuestItem", () => {
  beforeEach(() => jest.clearAllMocks());

  it("exibe título e ícone de checkbox vazio quando não-concluída", () => {
    render(
      <QuestItem
        quest={baseQuest}
        onToggled={jest.fn()}
        onDeleted={jest.fn()}
        onEdit={jest.fn()}
      />
    );

    expect(screen.getByText(/derrotar hornet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /completar quest/i })
    ).toBeInTheDocument();
  });

  it("exibe checkbox marcado quando concluída e oculta botão de editar", () => {
    render(
      <QuestItem
        quest={{ ...baseQuest, completed: true }}
        onToggled={jest.fn()}
        onDeleted={jest.fn()}
        onEdit={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /desmarcar quest/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar quest/i })
    ).not.toBeInTheDocument();
  });

  it("ao marcar como concluída, chama action e callback com novo gold", async () => {
    const user = userEvent.setup();
    const onToggled = jest.fn();
    toggleMock.mockResolvedValueOnce({
      success: true,
      data: {
        quest: { ...baseQuest, completed: true },
        newGoldBalance: 11,
      },
    });

    render(
      <QuestItem
        quest={baseQuest}
        onToggled={onToggled}
        onDeleted={jest.fn()}
        onEdit={jest.fn()}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /completar quest/i })
    );

    await waitFor(() => {
      expect(toggleMock).toHaveBeenCalledWith("q1");
    });
    expect(onToggled).toHaveBeenCalledWith(
      expect.objectContaining({ completed: true }),
      11
    );
  });

  it("abre modal de confirmação ao clicar em deletar", async () => {
    const user = userEvent.setup();
    render(
      <QuestItem
        quest={baseQuest}
        onToggled={jest.fn()}
        onDeleted={jest.fn()}
        onEdit={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /excluir quest/i }));

    expect(
      screen.getByText(/tem certeza que deseja excluir/i)
    ).toBeInTheDocument();
  });

  it("confirma deleção e chama callback onDeleted", async () => {
    const user = userEvent.setup();
    const onDeleted = jest.fn();
    deleteMock.mockResolvedValueOnce({ success: true, data: undefined });

    render(
      <QuestItem
        quest={baseQuest}
        onToggled={jest.fn()}
        onDeleted={onDeleted}
        onEdit={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /excluir quest/i }));
    await user.click(screen.getByRole("button", { name: /^excluir$/i }));

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith("q1");
    });
    expect(onDeleted).toHaveBeenCalledWith("q1");
  });
});
