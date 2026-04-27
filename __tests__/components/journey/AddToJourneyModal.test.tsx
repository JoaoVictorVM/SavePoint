/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/actions/journey", () => ({
  getGamesNotInJourney: jest.fn(),
  addGamesToJourney: jest.fn(),
}));

// Next.js Image em testes — substitui por <img> simples
jest.mock("next/image", () => ({
  __esModule: true,
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }
  ) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { AddToJourneyModal } from "@/components/journey/AddToJourneyModal";
import {
  getGamesNotInJourney,
  addGamesToJourney,
} from "@/actions/journey";

const getGamesMock = getGamesNotInJourney as jest.MockedFunction<
  typeof getGamesNotInJourney
>;
const addGamesMock = addGamesToJourney as jest.MockedFunction<
  typeof addGamesToJourney
>;

describe("AddToJourneyModal", () => {
  beforeEach(() => jest.clearAllMocks());

  it("exibe apenas os jogos retornados (não adicionados à journey)", async () => {
    getGamesMock.mockResolvedValueOnce([
      { id: "g1", title: "Hollow Knight", coverImageUrl: null },
      { id: "g2", title: "Elden Ring", coverImageUrl: null },
    ]);

    render(
      <AddToJourneyModal
        isOpen
        column="para_jogar"
        columnLabel="Para Jogar"
        onClose={jest.fn()}
        onAdded={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Hollow Knight")).toBeInTheDocument();
      expect(screen.getByText("Elden Ring")).toBeInTheDocument();
    });
  });

  it("permite seleção múltipla de jogos", async () => {
    const user = userEvent.setup();
    getGamesMock.mockResolvedValueOnce([
      { id: "g1", title: "Hollow Knight", coverImageUrl: null },
      { id: "g2", title: "Elden Ring", coverImageUrl: null },
    ]);
    addGamesMock.mockResolvedValueOnce({
      success: true,
      data: [
        {
          journeyItemId: "j1",
          gameId: "g1",
          title: "Hollow Knight",
          coverImageUrl: null,
          tags: [],
          column: "para_jogar",
          position: 0,
        },
        {
          journeyItemId: "j2",
          gameId: "g2",
          title: "Elden Ring",
          coverImageUrl: null,
          tags: [],
          column: "para_jogar",
          position: 1,
        },
      ],
    });

    const onAdded = jest.fn();
    const onClose = jest.fn();

    render(
      <AddToJourneyModal
        isOpen
        column="para_jogar"
        columnLabel="Para Jogar"
        onClose={onClose}
        onAdded={onAdded}
      />
    );

    await waitFor(() =>
      expect(screen.getByText("Hollow Knight")).toBeInTheDocument()
    );

    await user.click(screen.getByText("Hollow Knight"));
    await user.click(screen.getByText("Elden Ring"));
    await user.click(screen.getByRole("button", { name: /adicionar/i }));

    await waitFor(() => {
      expect(addGamesMock).toHaveBeenCalledWith(
        ["g1", "g2"],
        "para_jogar"
      );
    });
    expect(onAdded).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("exibe mensagem quando todos os jogos já estão na Journey", async () => {
    getGamesMock.mockResolvedValueOnce([]);

    render(
      <AddToJourneyModal
        isOpen
        column="para_jogar"
        columnLabel="Para Jogar"
        onClose={jest.fn()}
        onAdded={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/todos os jogos já estão na journey/i)
      ).toBeInTheDocument();
    });
  });
});
