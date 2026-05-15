import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppSidebar, type AppSidebarItem } from "./AppSidebar";

const items: AppSidebarItem[] = [
	{ label: "Dashboard", to: "/", icon: <DashboardIcon /> },
	{ label: "Nuevo evento", to: "/events/new", icon: <AddCircleOutlineIcon /> },
];

describe("AppSidebar", () => {
	it("renders the navigation items", () => {
		render(
			<AppSidebar
				title="Konevx"
				subtitle="Gestión de eventos"
				items={items}
				activePath="/"
				onNavigate={vi.fn()}
			/>,
		);

		expect(screen.getByText("Konevx")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Nuevo evento" })).toBeInTheDocument();
	});

	it("marks the active item", () => {
		render(
			<AppSidebar
				title="Konevx"
				subtitle="Gestión de eventos"
				items={items}
				activePath="/events/new"
				onNavigate={vi.fn()}
			/>,
		);

		expect(screen.getByRole("button", { name: "Nuevo evento" })).toHaveAttribute("aria-current", "page");
	});

	it("navigates when an item is clicked", () => {
		const onNavigate = vi.fn();

		render(
			<AppSidebar
				title="Konevx"
				subtitle="Gestión de eventos"
				items={items}
				activePath="/"
				onNavigate={onNavigate}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Nuevo evento" }));

		expect(onNavigate).toHaveBeenCalledWith("/events/new");
	});
});
