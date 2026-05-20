import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatePanel } from "./StatePanel";

describe("StatePanel", () => {
	it("renders a title and description", () => {
		render(<StatePanel title="Estado" description="Detalle" />);

		expect(screen.getByText("Estado")).toBeInTheDocument();
		expect(screen.getByText("Detalle")).toBeInTheDocument();
	});

	it("renders an action button", () => {
		const onAction = vi.fn();
		render(<StatePanel title="Estado" description="Detalle" actionLabel="Reintentar" onAction={onAction} />);

		fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

		expect(onAction).toHaveBeenCalledTimes(1);
	});
});
