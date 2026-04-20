import type { StateCreator } from 'zustand';
import type { Bookmark } from '../types/bookmarks';

export const MAX_BOOKMARKS = 200;

export interface BookmarksSlice {
    bookmarks: Bookmark[];
    addBookmark: (bookmark: Bookmark) => void;
    removeBookmark: (pageNumber: number) => void;
    isBookmarked: (pageNumber: number) => boolean;
}

export const createBookmarksSlice: StateCreator<
    BookmarksSlice,
    [['zustand/immer', never]],
    [],
    BookmarksSlice
> = (set, get) => ({
    bookmarks: [],

    addBookmark: (bookmark) =>
        set((state) => {
            const alreadyBookmarked = state.bookmarks.some(
                (b) => b.pageNumber === bookmark.pageNumber
            );
            if (alreadyBookmarked || state.bookmarks.length >= MAX_BOOKMARKS) {
                return;
            }
            state.bookmarks.push(bookmark);
        }),

    removeBookmark: (pageNumber) =>
        set((state) => {
            const index = state.bookmarks.findIndex((b) => b.pageNumber === pageNumber);
            if (index !== -1) {
                state.bookmarks.splice(index, 1);
            }
        }),

    isBookmarked: (pageNumber) =>
        get().bookmarks.some((b) => b.pageNumber === pageNumber),
});
