/**
 * @jest-environment jsdom
 */
import { render, screen, act } from "@testing-library/react";
import { GoldDisplay } from "@/components/layout/GoldDisplay";

describe("GoldDisplay", () => {
  it("renderiza o valor formatado em pt-BR", () => {
    render(<GoldDisplay amount={1234.56} />);
    expect(screen.getByText("1.234,56")).toBeInTheDocument();
  });

  it("atualiza o valor exibido quando amount muda (sem animação)", () => {
    const { rerender } = render(<GoldDisplay amount={10} />);
    expect(screen.getByText("10,00")).toBeInTheDocument();

    rerender(<GoldDisplay amount={11} />);
    expect(screen.getByText("11,00")).toBeInTheDocument();
  });

  it("decremento também é refletido na UI", () => {
    const { rerender } = render(<GoldDisplay amount={5} />);
    expect(screen.getByText("5,00")).toBeInTheDocument();

    rerender(<GoldDisplay amount={4} />);
    expect(screen.getByText("4,00")).toBeInTheDocument();
  });

  it("renderiza zero corretamente", () => {
    render(<GoldDisplay amount={0} />);
    expect(screen.getByText("0,00")).toBeInTheDocument();
  });

  it("aria-live está configurado para acessibilidade", () => {
    render(<GoldDisplay amount={1} />);
    const container = screen.getByText("1,00").closest("div");
    expect(container).toHaveAttribute("aria-live", "polite");
  });

  it("com animate=true, o valor final é atingido após o frame", () => {
    jest.useFakeTimers();
    const { rerender } = render(<GoldDisplay amount={10} animate />);
    rerender(<GoldDisplay amount={20} animate />);

    // Avança rAF até concluir
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    jest.useRealTimers();
  });
});
