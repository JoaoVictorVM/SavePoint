/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/actions/tags", () => ({
  createTag: jest.fn(),
  updateTag: jest.fn(),
  deleteTag: jest.fn(),
}));

jest.mock("@/stores/useAppStore", () => {
  const addTagFn = jest.fn();
  const updateTagFn = jest.fn();
  const removeTagFn = jest.fn();
  const tags = [
    {
      id: "11111111-0000-4000-8000-000000000001",
      userId: "user-1",
      name: "RPG",
      color: "#88C0D0",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  return {
    __mocks: { addTag: addTagFn, updateTag: updateTagFn, removeTag: removeTagFn },
    useAppStore: <T,>(
      selector: (s: {
        tags: typeof tags;
        addTag: typeof addTagFn;
        updateTag: typeof updateTagFn;
        removeTag: typeof removeTagFn;
      }) => T
    ) =>
      selector({
        tags,
        addTag: addTagFn,
        updateTag: updateTagFn,
        removeTag: removeTagFn,
      }),
  };
});

import { TagManager } from "@/components/tags/TagManager";
import { createTag, deleteTag } from "@/actions/tags";

const createMock = createTag as jest.MockedFunction<typeof createTag>;
const deleteMock = deleteTag as jest.MockedFunction<typeof deleteTag>;
const storeMock = jest.requireMock("@/stores/useAppStore") as {
  __mocks: {
    addTag: jest.Mock;
    updateTag: jest.Mock;
    removeTag: jest.Mock;
  };
};

describe("TagManager", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renderiza tags existentes na lista", () => {
    render(<TagManager isOpen onClose={jest.fn()} />);
    expect(screen.getByText("RPG")).toBeInTheDocument();
  });

  it("cria uma nova tag e adiciona ao store", async () => {
    const user = userEvent.setup();
    const newTag = {
      id: "11111111-0000-4000-8000-000000000002",
      userId: "user-1",
      name: "SoulsLike",
      color: "#88C0D0",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    createMock.mockResolvedValueOnce({ success: true, data: newTag });

    render(<TagManager isOpen onClose={jest.fn()} />);

    await user.type(
      screen.getByPlaceholderText(/nome da tag/i),
      "SoulsLike"
    );
    await user.click(screen.getByRole("button", { name: /criar tag/i }));

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledTimes(1);
    });
    expect(storeMock.__mocks.addTag).toHaveBeenCalledWith(newTag);
  });

  it("deleta uma tag após confirmação", async () => {
    const user = userEvent.setup();
    deleteMock.mockResolvedValueOnce({
      success: true,
      data: { affectedGames: 0 },
    });

    render(<TagManager isOpen onClose={jest.fn()} />);

    // Clica no botão de deletar tag
    await user.click(
      screen.getByRole("button", { name: /deletar tag/i })
    );
    // Modal/inline de confirmação aparece — clica em Confirmar
    await user.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith(
        "11111111-0000-4000-8000-000000000001"
      );
    });
    expect(storeMock.__mocks.removeTag).toHaveBeenCalled();
  });
});
