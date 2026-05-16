import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventCard } from "./cards/EventCard";

const navigateMock = vi.fn();
const mutatePublishMock = vi.fn();
const mutateDeleteMock = vi.fn();

vi.mock("react-router-dom", async () => ({
	...(await vi.importActual<typeof import("react-router-dom")>("react-router-dom")),
	useNavigate: () => navigateMock,
}));

vi.mock("../hooks/useEvents", () => ({
	useSetPublish: () => ({ isPending: false, mutate: mutatePublishMock }),
	useDeleteEvent: () => ({ isPending: false, mutate: mutateDeleteMock }),
}));

const event = {
	id: 1,
	name: "Fiesta Konevx",
	slug: "fiesta-konevx",
	isPublished: true,
	capacity: 200,
	contactRequirement: "EMAIL" as const,
	createdAt: new Date().toISOString(),
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
};

describe("EventCard", () => {
	beforeEach(() => {
		navigateMock.mockClear();
		mutatePublishMock.mockClear();
		mutateDeleteMock.mockClear();
	});

	it("renders the event summary", () => {
		render(<EventCard event={event} />);

		expect(screen.getByText("Fiesta Konevx")).toBeInTheDocument();
		expect(screen.getByText("/fiesta-konevx")).toBeInTheDocument();
		expect(screen.getByText("200 cupos")).toBeInTheDocument();
	});

	it("navigates to the event detail when clicked", () => {
		render(<EventCard event={event} />);

		fireEvent.click(screen.getByText("Fiesta Konevx"));

		expect(navigateMock).toHaveBeenCalledWith("/events/1");
	});
});
