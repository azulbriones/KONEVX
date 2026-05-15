import { describe, expect, it, beforeEach } from "vitest";
import { useLayoutStore } from "./useLayoutStore";

describe("useLayoutStore", () => {
	beforeEach(() => {
		useLayoutStore.setState({ mobileDrawerOpen: false, sidebarCollapsed: false });
	});

	it("opens and closes the mobile drawer", () => {
		useLayoutStore.getState().openMobileDrawer();
		expect(useLayoutStore.getState().mobileDrawerOpen).toBe(true);

		useLayoutStore.getState().closeMobileDrawer();
		expect(useLayoutStore.getState().mobileDrawerOpen).toBe(false);
	});

	it("toggles the mobile drawer", () => {
		useLayoutStore.getState().toggleMobileDrawer();
		expect(useLayoutStore.getState().mobileDrawerOpen).toBe(true);
	});

	it("sets sidebar collapsed state", () => {
		useLayoutStore.getState().setSidebarCollapsed(true);
		expect(useLayoutStore.getState().sidebarCollapsed).toBe(true);
	});
});
