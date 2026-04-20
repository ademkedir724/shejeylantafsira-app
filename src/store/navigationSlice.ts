import type { StateCreator } from 'zustand';

export interface NavigationSlice {
    currentPage: number;
    isPageLocked: boolean;
    isFullScreen: boolean;
    setCurrentPage: (page: number) => void;
    togglePageLock: () => void;
    toggleFullScreen: () => void;
}

export const createNavigationSlice: StateCreator<
    NavigationSlice,
    [['zustand/immer', never]],
    [],
    NavigationSlice
> = (set) => ({
    currentPage: 1,
    isPageLocked: false,
    isFullScreen: false,

    setCurrentPage: (page) =>
        set((state) => {
            state.currentPage = Math.min(604, Math.max(1, page));
        }),

    togglePageLock: () =>
        set((state) => {
            state.isPageLocked = !state.isPageLocked;
        }),

    toggleFullScreen: () =>
        set((state) => {
            state.isFullScreen = !state.isFullScreen;
        }),
});
