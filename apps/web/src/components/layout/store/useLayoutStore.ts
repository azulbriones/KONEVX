import { create } from "zustand";

type LayoutState = {
  mobileDrawerOpen: boolean;
  sidebarCollapsed: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  toggleMobileDrawer: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

export const useLayoutStore = create<LayoutState>((set) => ({
  mobileDrawerOpen: false,
  sidebarCollapsed: false,
  openMobileDrawer: () => set({ mobileDrawerOpen: true }),
  closeMobileDrawer: () => set({ mobileDrawerOpen: false }),
  toggleMobileDrawer: () =>
    set((state) => ({ mobileDrawerOpen: !state.mobileDrawerOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
