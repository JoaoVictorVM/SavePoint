/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/components/ui/Modal";

describe("Modal (global)", () => {
  it("renderiza o título e o conteúdo quando aberto", () => {
    render(
      <Modal isOpen onClose={jest.fn()} title="Título do Modal">
        <p>conteúdo</p>
      </Modal>
    );

    expect(
      screen.getByRole("heading", { name: /título do modal/i })
    ).toBeInTheDocument();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("não renderiza nada quando fechado", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={jest.fn()} title="X">
        <p>conteúdo</p>
      </Modal>
    );
    expect(container.querySelector("dialog")).toBeNull();
  });

  it("aplica classes de centralização (fixed inset-0 m-auto)", () => {
    render(
      <Modal isOpen onClose={jest.fn()} title="Centro">
        <p>x</p>
      </Modal>
    );

    const dialog = screen.getByRole("heading", {
      name: /centro/i,
    }).closest("dialog");
    expect(dialog?.className).toContain("fixed");
    expect(dialog?.className).toContain("inset-0");
    expect(dialog?.className).toContain("m-auto");
  });

  it("chama onClose ao clicar no botão Fechar", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <Modal isOpen onClose={onClose} title="X">
        <p>x</p>
      </Modal>
    );

    await user.click(screen.getByRole("button", { name: /fechar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
