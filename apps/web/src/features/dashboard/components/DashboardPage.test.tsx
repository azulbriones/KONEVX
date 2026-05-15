import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";
import type { EventListItem } from "@/features/events/types";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => ({
	...(await vi.importActual<typeof import("react-router-dom")>("react-router-dom")),
	useNavigate: () => navigateMock,
}));

vi.mock("@/features/events/hooks/useEvents", () => ({
	useEvents: vi.fn(),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
	useLogout: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/features/events/components/cards/EventCard", () => ({
	EventCard: () => <div data-testid="event-card" />,
}));

import { useEvents } from "@/features/events/hooks/useEvents";

describe("DashboardPage", () => {
	const events: EventListItem[] = [
		{
			id: 1,
			name: "Evento 1",
			slug: "evento-1",
			isPublished: true,
			capacity: 100,
			contactRequirement: "EMAIL",
			createdAt: "2026-01-01T00:00:00.000Z",
			access: {
				scope: "SUPER_ADMIN",
				isSuperAdmin: true,
				eventRole: null,
				canRead: true,
				canWrite: true,
				canManageMembers: true,
				canManageFields: true,
				canExport: true,
				canCheckIn: true,
				canView: true,
			},
		},
		{
			id: 2,
			name: "Evento 2",
			slug: "evento-2",
			isPublished: false,
			capacity: 50,
			contactRequirement: "PHONE",
			createdAt: "2026-01-02T00:00:00.000Z",
			access: {
				scope: "MEMBER",
				isSuperAdmin: false,
				eventRole: "EDITOR",
				canRead: true,
				canWrite: true,
				canManageMembers: false,
				canManageFields: false,
				canExport: false,
				canCheckIn: false,
				canView: true,
			},
		},
	];

	type UseEventsResult = ReturnType<typeof useEvents>;

	const mockUseEvents = (overrides: Partial<UseEventsResult>) =>
		vi.mocked(useEvents).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
			error: null,
			...overrides,
		} as UseEventsResult);

	it("shows the loading state", () => {
		mockUseEvents({ isLoading: true });

		render(<DashboardPage />);

		expect(screen.getByRole("progressbar")).toBeInTheDocument();
	});

	it("shows the empty state", () => {
		mockUseEvents({ data: [] });

		render(<DashboardPage />);

		expect(screen.getByText("Aún no tienes eventos")).toBeInTheDocument();
	});

	it("shows the error state", () => {
		mockUseEvents({ isError: true, error: new Error("boom") });

		render(<DashboardPage />);

		expect(screen.getByText("No pudimos cargar los eventos")).toBeInTheDocument();
	});

	it("shows dashboard metrics when events exist", () => {
		mockUseEvents({ data: events });

		render(<DashboardPage />);

		expect(screen.getByText("EVENTOS")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.getAllByTestId("event-card")).toHaveLength(2);
	});
});
