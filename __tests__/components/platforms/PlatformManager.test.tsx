/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/actions/platforms", () => ({
  createPlatform: jest.fn(),
  updatePlatform: jest.fn(),
  deletePlatform: jest.fn(),
}));

jest.mock("@/stores/useAppStore", () => {
  const addPlatformFn = jest.fn();
  const updatePlatformFn = jest.fn();
  const removePlatformFn = jest.fn();
  const platforms = [
    {
      id: "33333333-0000-4000-8000-000000000001",
      userId: "user-1",
      name: "PC",
      color: "#5E81AC",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  return {
    __mocks: {
      addPlatform: addPlatformFn,
      updatePlatform: updatePlatformFn,
      removePlatform: removePlatformFn,
    },
    useAppStore: <T,>(
      selector: (s: {
        platforms: typeof platforms;
        addPlatform: typeof addPlatformFn;
        updatePlatform: typeof updatePlatformFn;
        removePlatform: typeof removePlatformFn;
      }) => T
    ) =>
      selector({
        platforms,
        addPlatform: addPlatformFn,
        updatePlatform: updatePlatformFn,
        removePlatform: removePlatformFn,
      }),
  };
});

import { PlatformManager } from "@/components/platforms/PlatformManager";
import { createPlatform } from "@/actions/platforms";

const createMock = createPlatform as jest.MockedFunction<typeof createPlatform>;
const storeMock = jest.requireMock("@/stores/useAppStore") as {
  __mocks: { addPlatform: jest.Mock };
};

describe("PlatformManager", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renderiza plataformas existentes", () => {
    render(<PlatformManager isOpen onClose={jest.fn()} />);
    expect(screen.getByText("PC")).toBeInTheDocument();
  });

  it("cria uma nova plataforma e atualiza o store", async () => {
    const user = userEvent.setup();
    const newPlatform = {
      id: "33333333-0000-4000-8000-000000000002",
      userId: "user-1",
      name: "PlayStation 5",
      color: "#5E81AC",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    createMock.mockResolvedValueOnce({ success: true, data: newPlatform });

    render(<PlatformManager isOpen onClose={jest.fn()} />);

    await user.type(
      screen.getByPlaceholderText(/nome da plataforma/i),
      "PlayStation 5"
    );
    await user.click(
      screen.getByRole("button", { name: /criar plataforma/i })
    );

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledTimes(1);
    });
    expect(storeMock.__mocks.addPlatform).toHaveBeenCalledWith(newPlatform);
  });
});
