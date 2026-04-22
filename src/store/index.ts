import AsyncStorage from '@react-native-async-storage/async-storage';
import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { AudioSlice } from './audioSlice';
import { createAudioSlice } from './audioSlice';
import type { BookmarksSlice } from './bookmarksSlice';
import { createBookmarksSlice } from './bookmarksSlice';
import type { DownloadSlice } from './downloadSlice';
import { createDownloadSlice } from './downloadSlice';
import type { NavigationSlice } from './navigationSlice';
import { createNavigationSlice } from './navigationSlice';
import type { PreferencesSlice } from './preferencesSlice';
import { createPreferencesSlice } from './preferencesSlice';

// Required for Immer to handle Set types
enableMapSet();

export type AppStore = AudioSlice &
    DownloadSlice &
    NavigationSlice &
    PreferencesSlice &
    BookmarksSlice & {
        _hasHydrated: boolean;
        setHasHydrated: (v: boolean) => void;
    };

interface PersistedState {
    preferences: PreferencesSlice['preferences'];
    downloadedPages: number[];
    bookmarks: BookmarksSlice['bookmarks'];
}

export const useStore = create<AppStore>()(
    immer(
        persist(
            (...a) => ({
                ...createAudioSlice(...a),
                ...createDownloadSlice(...a),
                ...createNavigationSlice(...a),
                ...createPreferencesSlice(...a),
                ...createBookmarksSlice(...a),
                _hasHydrated: false,
                setHasHydrated: (v: boolean) => {
                    const [set] = a;
                    set((state) => { state._hasHydrated = v; });
                },
            }),
            {
                name: 'quran-tafsir-store',
                storage: createJSONStorage(() => AsyncStorage),

                partialize: (state): PersistedState => ({
                    preferences: state.preferences,
                    downloadedPages: [...state.downloadedPages],
                    bookmarks: state.bookmarks,
                }),

                merge: (persistedState, currentState) => {
                    const persisted = persistedState as PersistedState;
                    return {
                        ...currentState,
                        preferences: persisted.preferences ?? currentState.preferences,
                        downloadedPages: new Set<number>(persisted.downloadedPages ?? []),
                        bookmarks: persisted.bookmarks ?? currentState.bookmarks,
                    };
                },

                onRehydrateStorage: () => (state) => {
                    state?.setHasHydrated(true);
                },
            }
        )
    )
);

export default useStore;
