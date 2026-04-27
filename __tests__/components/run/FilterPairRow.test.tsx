/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterPairRow } from "@/components/run/FilterPairRow";
import type { RunFilterPair } from "@/lib/run-constants";

const baseProps = {
  allTags: [
    {
      id: "11111111-0000-4000-8000-000000000001",
      userId: "u",
      name: "RPG",
      color: "#88C0D0",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  allPlatforms: [
    {
      id: "33333333-0000-4000-8000-000000000001",
      userId: "u",
      name: "PC",
      color: "#5E81AC",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

describe("FilterPairRow", () => {
  it("Filtro 2 não aparece enquanto o Filtro 1 não foi selecionado", () => {
    const pair: RunFilterPair = { category: "", values: [] };
    render(
      <FilterPairRow
        {...baseProps}
        pair={pair}
        onChange={jest.fn()}
        onRemove={jest.fn()}
        canRemove={false}
      />
    );

    // O label "Filtro 2" não deve estar presente
    expect(screen.queryByText(/filtro 2/i)).not.toBeInTheDocument();
  });

  it("Filtro 2 é renderizado após selecionar 'tags' como categoria", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const pair: RunFilterPair = { category: "", values: [] };

    const { rerender } = render(
      <FilterPairRow
        {...baseProps}
        pair={pair}
        onChange={onChange}
        onRemove={jest.fn()}
        canRemove={false}
      />
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      "tags"
    );
    expect(onChange).toHaveBeenCalledWith({
      category: "tags",
      values: [],
    });

    // Após o pai re-renderizar com a nova category, Filtro 2 aparece
    rerender(
      <FilterPairRow
        {...baseProps}
        pair={{ category: "tags", values: [] }}
        onChange={onChange}
        onRemove={jest.fn()}
        canRemove={false}
      />
    );

    expect(screen.getByText(/filtro 2/i)).toBeInTheDocument();
    expect(screen.getByText("RPG")).toBeInTheDocument();
  });

  it("trocar o Filtro 1 reseta os values do Filtro 2", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const pair: RunFilterPair = {
      category: "tags",
      values: ["11111111-0000-4000-8000-000000000001"],
    };

    render(
      <FilterPairRow
        {...baseProps}
        pair={pair}
        onChange={onChange}
        onRemove={jest.fn()}
        canRemove={false}
      />
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      "plataforma"
    );

    expect(onChange).toHaveBeenCalledWith({
      category: "plataforma",
      values: [],
    });
  });

  it("favoritos auto-marca o checkbox 'Favorito' (locked)", () => {
    render(
      <FilterPairRow
        {...baseProps}
        pair={{ category: "favoritos", values: ["favorito"] }}
        onChange={jest.fn()}
        onRemove={jest.fn()}
        canRemove={false}
      />
    );

    expect(screen.getByText(/^favorito$/i)).toBeInTheDocument();
  });

  it("exibe mensagem quando categoria é 'tags' mas usuário não tem nenhuma cadastrada", () => {
    render(
      <FilterPairRow
        {...baseProps}
        allTags={[]}
        pair={{ category: "tags", values: [] }}
        onChange={jest.fn()}
        onRemove={jest.fn()}
        canRemove={false}
      />
    );

    expect(
      screen.getByText(/nenhuma tag cadastrada/i)
    ).toBeInTheDocument();
  });

  it("não exibe botão de remover quando canRemove=false", () => {
    render(
      <FilterPairRow
        {...baseProps}
        pair={{ category: "", values: [] }}
        onChange={jest.fn()}
        onRemove={jest.fn()}
        canRemove={false}
      />
    );

    expect(
      screen.queryByRole("button", { name: /remover filtro/i })
    ).not.toBeInTheDocument();
  });
});
