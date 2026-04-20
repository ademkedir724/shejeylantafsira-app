import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Combined store type
export type AppStore = AudioSlice &
    DownloadSlice &
    NavigationSlice &
    PreferencesSlice &
    BookmarksSlice & {
        _hasHydrated: boolean;
        setHasHydrated: (value: boolean) => void;
    };

// Persisted state shape (what gets written to AsyncStorage)
interface PersistedState {
    preferences: PreferencesSlice['preferences'];
    downloadedPages: number[]; // Set<number> serialized as array
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

                // Hydration flag — not persisted
                _hasHydrated: false,
                setHasHydrated: (value: boolean) => {
                    const [set] = a;
                    set((state) => {
                        state._hasHydrated = value;
                    });
                },
            }),
            {
                name: 'quran-tafsir-store',
                storage: createJSONStorage(() => AsyncStorage),

                // Only persist preferences, downloadedPages (as array), and bookmarks
                partialize: (state): PersistedState => ({
                    preferences: state.preferences,
                    downloadedPages: [...state.downloadedPages],
                    bookmarks: state.bookmarks,
                }),

                // Rehydrate: convert downloadedPages array back to Set<number>
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
                    if (state) {
                        state.setHasHydrated(true);
                    }
                },
            }
        )
    )
);

export default useStore;
