import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventSectionTabs, type EventSectionTab } from "./sections/EventSectionTabs";

const tabs: EventSectionTab[] = [
	{ label: "Resumen", path: "overview", enabled: true },
	{ label: "Check-in", path: "check-in", enabled: true },
	{ label: "Campos", path: "fields", enabled: false },
];

describe("EventSectionTabs", () => {
	it("renders enabled tabs", () => {
		render(
			<EventSectionTabs
				tabs={tabs}
				currentTab="overview"
				isPublished={false}
				canWrite
				onNavigate={vi.fn()}
				onTogglePublish={vi.fn()}
				isPublishing={false}
			/>,
		);

		expect(screen.getByRole("tab", { name: "Resumen" })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "Check-in" })).toBeInTheDocument();
		expect(screen.queryByRole("tab", { name: "Campos" })).not.toBeInTheDocument();
	});

	it("navigates when a tab is clicked", () => {
		const onNavigate = vi.fn();

		render(
			<EventSectionTabs
				tabs={tabs}
				currentTab="overview"
				isPublished={false}
				canWrite
				onNavigate={onNavigate}
				onTogglePublish={vi.fn()}
				isPublishing={false}
			/>,
		);

		fireEvent.click(screen.getByRole("tab", { name: "Check-in" }));

		expect(onNavigate).toHaveBeenCalledWith("check-in");
	});

	it("renders publish action for writers", () => {
		render(
			<EventSectionTabs
				tabs={tabs}
				currentTab="overview"
				isPublished={true}
				canWrite
				onNavigate={vi.fn()}
				onTogglePublish={vi.fn()}
				isPublishing={false}
			/>,
		);

		expect(screen.getByRole("button", { name: "Pasar a borrador" })).toBeInTheDocument();
	});
});
