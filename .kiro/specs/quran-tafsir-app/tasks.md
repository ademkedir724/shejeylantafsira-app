# Implementation Plan: Qur'an Tafsir App

## Overview

Incremental implementation of a production-grade Qur'an tafsir mobile app (React Native / Expo Router, TypeScript). Each task builds on the previous, ending with full integration. All 604-page audio is hosted on Cloudflare R2; only 3 sample pages are bundled. The architecture uses five Zustand slices, expo-av, expo-file-system, and Expo Router file-based navigation.

---

## Tasks

- [x] 1. Project setup and folder structure
  - Scaffold the directory tree: `src/components/`, `src/features/{audio,download,quran,search}/`, `src/store/`, `src/hooks/`, `src/constants/i18n/`, `src/types/`, `assets/audio/samples/`, `assets/fonts/`, `assets/pages/`
  - Add `tsconfig.json` path alias `@/*` → `src/*` and update `babel.config.js` with `babel-plugin-module-resolver`
  - Install all required packages: `zustand`, `immer`, `@react-native-async-storage/async-storage`, `expo-av`, `expo-file-system`, `@react-native-community/netinfo`, `react-native-gesture-handler`, `fast-check`, `uuid`
  - Add `.gitkeep` to `assets/pages/` and placeholder `assets/audio/samples/` README
  - Enable TypeScript strict mode in `tsconfig.json`
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. TypeScript types and interfaces
  - Create `src/types/quran.ts`: `PageMetadata`, `SurahInfo`, `JuzInfo`, `PageData` (with optional `tafsirText`, `recitationAudioUrl`, `bookmarkId`)
  - Create `src/types/audio.ts`: `AudioSourceType`, `AudioSource`, `AudioState`
  - Create `src/types/download.ts`: `DownloadStatus`, `DownloadItem`, `DownloadState`
  - Create `src/types/preferences.ts`: `ReadingTheme`, `UILanguage`, `PlaybackSpeed`, `UserPreferences`
  - Create `src/types/bookmarks.ts`: `Bookmark`
  - Export all types from `src/types/index.ts`
  - _Requirements: 1.2, 13.1, 13.2_

- [x] 3. Static Qur'an metadata data file
  - Create `src/features/quran/data/pages.ts` exporting a typed array of 604 `PageMetadata` entries (page number, juz, surah number, surah name Arabic + English, start/end ayah, `isFirstPageOfSurah`, `hasBasmala`)
  - Create `src/features/quran/metadata.ts` with: `getPageMetadata(n)` O(1) indexed lookup, `getPagesByJuz(juz)`, `getPagesBySurah(surah)`, `getAllSurahs()` (114 entries), `getAllJuz()` (30 entries), `searchSurahs(query)` (partial match Arabic + English)
  - Export from `src/features/quran/index.ts`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 4. Zustand store slices
  - [x] 4.1 Create `src/store/audioSlice.ts` implementing `AudioSlice` with initial state and all actions: `setAudioPage`, `setPlaying`, `setPosition`, `setDuration`, `setPlaybackSpeed`, `toggleRepeat`, `setSleepTimer`, `setAudioError`, `resetAudio`
    - _Requirements: 12.1, 12.2, 12.3, 21.1_
  - [x] 4.2 Create `src/store/downloadSlice.ts` implementing `DownloadSlice` with: `enqueueDownload`, `enqueueJuz`, `enqueueAll`, `cancelDownload`, `pauseQueue`, `resumeQueue`, `markDownloaded`, `markMissing`, `updateProgress`
    - _Requirements: 12.2, 12.4, 10.9, 31.1_
  - [x] 4.3 Create `src/store/navigationSlice.ts` with: `currentPage`, `isPageLocked`, `isFullScreen`, `setCurrentPage`, `togglePageLock`, `toggleFullScreen`
    - _Requirements: 12.2, 20.1, 18.1_
  - [x] 4.4 Create `src/store/preferencesSlice.ts` with all `UserPreferences` fields and setters: `setTheme`, `setFontSize`, `setMushafImageMode`, `setAutoAdvance`, `setPlaybackSpeed`, `setUILanguage`, `setWifiOnlyDownload`, `setLastReadPage`
    - _Requirements: 12.2, 13.2, 15.5, 16.4, 21.6, 23.6_
  - [x] 4.5 Create `src/store/bookmarksSlice.ts` with: `bookmarks: Bookmark[]`, `addBookmark`, `removeBookmark`, `isBookmarked` (enforces 200-bookmark cap)
    - _Requirements: 12.2, 13.3, 26.2, 26.3, 26.9_
  - [x] 4.6 Compose all slices in `src/store/index.ts` using `create` + `immer` + `persist` middleware (AsyncStorage adapter); `partialize` to persist only `preferences`, `downloadedPages`, `bookmarks`
    - _Requirements: 12.1, 12.5, 11.5_

- [x] 5. AsyncStorage persistence layer
  - Create `src/features/download/storageKeys.ts` with all `@quran/` key constants
  - Verify the Zustand `persist` middleware correctly serializes/deserializes `downloadedPages` (Set → Array → Set) and `bookmarks` array on store rehydration
  - Add store hydration guard in root layout so screens wait for `_hasHydrated` before rendering
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 6. Remote storage config
  - Create `src/constants/config.ts` with: `R2_BASE_URL` (from `EXPO_PUBLIC_R2_BASE_URL`), `SAMPLE_PAGES`, `SamplePage` type, `buildLqUrl(n)`, `buildHqUrl(n)`, `MAX_CONCURRENT_DOWNLOADS`, `MAX_BOOKMARKS`, `LAST_READ_SAVE_DEBOUNCE_MS`, `AUTO_ADVANCE_DELAY_MS`, `FULL_SCREEN_CONTROLS_TIMEOUT_MS`
  - Add `.env.example` documenting `EXPO_PUBLIC_R2_BASE_URL`
  - _Requirements: 9.5, 9.6_

- [x] 7. i18n localization system
  - Create `src/constants/i18n/en.ts` with all UI string keys (100+ keys covering all screen titles, button labels, error messages, prompts)
  - Create `src/constants/i18n/om.ts` (Afaan Oromo) and `src/constants/i18n/ar.ts` (Arabic) mirroring the same key set
  - Create `src/constants/i18n/index.ts` with `t(key, locale)` lookup function and `TranslationKey` / `Locale` types
  - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.6_

- [x] 8. Theme system
  - Create `src/constants/theme.ts` defining color palettes for all four `ReadingTheme` values (light, dark, sepia, paper), typography scale (min 20sp Arabic), and spacing constants
  - Create `src/hooks/useTheme.ts` that reads `preferences.theme` from the store and returns the active palette + typography
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 16.1, 16.5, 16.6_

- [x] 9. Audio engine — resolveAudioSource and expo-av integration
  - Implement `resolveAudioSource(pageNumber, downloadedPages, baseUrl): AudioSource | null` in `src/features/audio/audioEngine.ts` with the three-priority logic (bundled → local → remote → null)
  - Implement `useAudioEngine.ts` hook managing `Audio.Sound` lifecycle: `loadPage`, `play`, `pause`, `seekTo`, `setSpeed`, `release`; dispatches to audio slice on every `onPlaybackStatusUpdate` callback
  - Configure `Audio.setAudioModeAsync` for silent-mode iOS playback (Req 8.10)
  - Export from `src/features/audio/index.ts`
  - _Requirements: 8.1–8.10, 9.1–9.4, 9.6, 9.7_

- [x] 10. Background audio and lock screen controls
  - Create `src/features/audio/lockScreen.ts`: call `Audio.setAudioModeAsync({ staysActiveInBackground: true, playsInSilentModeIOS: true, ... })` once at app startup
  - Register OS media session metadata (surah name + page number as track title, "Sheikh Jeylan" as artist) and wire next/previous actions to dispatch `setCurrentPage` on the navigation slice
  - Call `lockScreen.ts` initializer from `app/_layout.tsx`
  - _Requirements: 24.1–24.7_

- [x] 11. Download manager
  - Implement `src/features/download/downloadManager.ts`: `processQueue` function maintaining at most `MAX_CONCURRENT_DOWNLOADS` active `FileSystem.createDownloadResumable` instances; `startDownload` creates directory, downloads to `{documentDirectory}/audio/lq/{n}.mp3`, calls `markDownloaded` on success or `setError` on failure
  - Implement `useDownloadManager.ts` hook that calls `processQueue` reactively when queue or network state changes
  - Implement launch-time integrity check: for each page in `downloadedPages`, call `FileSystem.getInfoAsync`; call `markMissing` for any absent file
  - _Requirements: 10.2–10.10, 11.3, 11.4, 31.1, 31.2_

- [x] 12. Network state hook
  - Create `src/hooks/useNetworkState.ts` wrapping `@react-native-community/netinfo` to expose `{ isConnected: boolean, isWifi: boolean }`
  - Wire offline detection to pause the download queue (call `pauseQueue`) and resume it (call `resumeQueue`) automatically on connectivity change
  - _Requirements: 30.1, 30.4, 30.5, 31.5, 31.6_

- [x] 13. Expo Router navigation structure
  - Replace the default Expo Router scaffold with the target structure: `app/_layout.tsx` (root stack, font loading, store hydration, lock screen init), `app/(tabs)/_layout.tsx` (5-tab bar: Home, Juz, Surah, Search, Settings), `app/(tabs)/index.tsx`, `app/(tabs)/juz.tsx`, `app/(tabs)/surah.tsx`, `app/(tabs)/search.tsx`, `app/(tabs)/settings.tsx`, `app/page/[pageNumber].tsx`, `app/bookmarks.tsx`, `app/downloads.tsx`
  - Load `KFGQPCUthmanicScript.ttf` via `expo-font` in root layout
  - Apply RTL via `I18nManager.forceRTL(true)` when `uiLanguage === 'ar'`
  - _Requirements: 1.1, 14.5, 29.5_

- [x] 14. Home screen
  - Implement `app/(tabs)/index.tsx`: read `preferences.lastReadPage` from store; if set, render "Resume from page X" card with a "Resume" button that calls `router.push('/page/[lastReadPage]')`; if not set, render a welcome/start prompt
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [x] 15. Juz browser screen
  - Implement `app/(tabs)/juz.tsx`: render a `FlatList` of 30 `JuzInfo` entries (juz number, starting surah Arabic + English, starting page); each row navigates to `router.push('/page/[startPage]')`; add "Download entire Juz" button per row that calls `enqueueJuz(juzNumber)`
  - _Requirements: 4.1, 4.2, 4.3, 31.3_

- [x] 16. Surah browser screen
  - Implement `app/(tabs)/surah.tsx`: render a `FlatList` of 114 `SurahInfo` entries (surah number, Arabic name, English name, total ayahs, starting page); each row navigates to `router.push('/page/[startPage]')`; include commented placeholder for future search bar (Req 13.5)
  - _Requirements: 5.1, 5.2, 5.3, 13.5_

- [x] 17. Page browser screen
  - Implement a page-browser accessible from the navigation (modal or dedicated tab); render a `FlatList` of 604 page entries (page number, surah name, juz number); include a numeric input that validates range [1, 604] and navigates on submit; show validation message for out-of-range input
  - _Requirements: 6.1–6.5_

- [x] 18. Page screen — core layout and metadata display
  - Implement `app/page/[pageNumber].tsx`: parse `pageNumber` route param; on mount call `setCurrentPage`, `setLastReadPage` (debounced 1s), and `loadPage`; render `PageHeader`, surah name (Arabic + English), ayah range, juz number, previous/next navigation buttons (disabled at boundaries 1 and 604); stop audio on page change
  - _Requirements: 7.1–7.11, 15.1_

- [x] 19. Mushaf Tajweed text component
  - Implement `src/components/MushafText.tsx`: accept `pageNumber`, `fontSize`, `theme`; render Tajweed-colored Arabic text from `pages.ts` using inline `Text` color styles per character group; use `KFGQPCUthmanicScript` font; RTL layout; display Basmala at top of surah-first pages (except Surah 9); no horizontal scroll
  - _Requirements: 3.1–3.6_

- [x] 20. Mushaf Image Mode component
  - Implement `src/components/MushafImage.tsx`: accept `pageNumber`, `onFallback`; render `<Image source={require(`../../../assets/pages/${pageNumber}.png`)} resizeMode="contain" />`; call `onFallback` on error; integrate toggle in Page Screen to switch between `MushafText` and `MushafImage`; disable font-size slider when image mode is active
  - _Requirements: 17.4–17.8_

- [x] 21. Audio player component
  - Implement `src/components/AudioPlayer.tsx`: play/pause button, `Slider` seek bar, elapsed/total time (MM:SS), speed button (opens `SpeedPickerSheet`), repeat toggle, sleep timer button (opens `SleepTimerModal`), "Sample" badge for sample pages; reads from `useStore(s => s.audio)`; renders "Audio coming soon" placeholder when source is null
  - Implement `src/components/SpeedPickerSheet.tsx`: bottom sheet with 5 speed options; calls `setPlaybackSpeed` and applies immediately to loaded sound
  - Implement `src/components/SleepTimerModal.tsx`: duration picker (5/10/15/30/45/60 min + "End of current page"); countdown display; cancel button; pauses audio at zero and shows "Sleep timer ended" notification
  - Wire auto-advance: when `onPlaybackStatusUpdate` reports `didJustFinish` and `autoAdvance` is true and `isRepeat` is false, navigate to next page after `AUTO_ADVANCE_DELAY_MS`
  - _Requirements: 8.1–8.7, 9.7, 21.1–21.6, 22.1–22.7, 23.1–23.6, 25.1–25.5_

- [x] 22. Download button component
  - Implement `src/components/DownloadButton.tsx`: reads download state for `pageNumber` from store; renders download icon (not downloaded), circular progress ring (downloading), checkmark (downloaded), or error icon with retry tap handler; tapping download icon calls `enqueueDownload(pageNumber)`
  - _Requirements: 10.1–10.7_

- [x] 23. Offline banner component
  - Implement `src/components/OfflineBanner.tsx`: reads `useNetworkState()`; renders a persistent banner when `!isConnected`; auto-hides when reconnected; show "No internet connection. Download this page to listen offline." message on Page Screen when page is not downloaded and offline
  - _Requirements: 30.2, 30.3, 30.4_

- [x] 24. Full-screen reading mode
  - Add full-screen toggle to `PageHeader`; when active: hide navigation header, tab bar, audio player card, and all overlay controls; hide status bar via `expo-status-bar`; tap-to-reveal controls for `FULL_SCREEN_CONTROLS_TIMEOUT_MS` (3s); audio continues uninterrupted; toggle exits full-screen and restores all UI
  - _Requirements: 18.1–18.6_

- [x] 25. Swipe page-turn gesture
  - Wrap Page Screen content in a `GestureDetector` (react-native-gesture-handler `PanGesture`); left swipe → next page, right swipe → previous page; page-turn slide animation; bounce-back animation at page 1 (right swipe) and page 604 (left swipe); coexist with vertical scroll
  - _Requirements: 19.1–19.6_

- [x] 26. Page lock feature
  - Wire `togglePageLock` to the lock button in `PageHeader`; when `isPageLocked` is true: disable previous/next buttons, swipe gestures, and list-navigation pushes; show padlock icon indicator; audio controls remain functional; lock state resets to false on app restart (not persisted)
  - _Requirements: 20.1–20.6_

- [x] 27. Bookmarks feature
  - Implement `src/components/BookmarkModal.tsx`: label input (max 60 chars), save/cancel; shown when tapping bookmark icon on unbookmarked page; confirmation prompt when tapping on already-bookmarked page
  - Implement `app/bookmarks.tsx`: `FlatList` of all bookmarks (page number, surah name, juz number, label, date); tap navigates to page; swipe-to-delete or long-press delete calls `removeBookmark`; accessible from Settings header icon
  - Wire bookmark icon in `PageHeader` to `isBookmarked(pageNumber)` for filled/outline state
  - _Requirements: 26.1–26.9_

- [x] 28. Search screen
  - Implement `app/(tabs)/search.tsx`: auto-focused text input; as user types, call `searchSurahs(query)` for surah matches and parse numeric input for page/juz/surah number results; render results list with "Go to page X", "Go to Juz X", "Go to Surah X" entries; tapping any result navigates to corresponding page; "No results found" empty state; wire to `SearchProvider` stub from `src/features/search/index.ts`
  - Create `src/features/search/index.ts` with `SearchProvider` interface, `SearchResult` type, and `defaultSearchProvider` metadata-only implementation
  - Create `src/features/search/README.md` describing future full-text Arabic ayah search API
  - _Requirements: 27.1–27.10, 13.4_

- [x] 29. Settings screen
  - Implement `app/(tabs)/settings.tsx`: theme selector (4 options), font size slider (16–36sp, step 2), Mushaf Image Mode toggle, Auto-Advance toggle, default playback speed picker, UI language selector (om/en/ar), Wi-Fi only download toggle; Storage Usage section (total MB, page count, "Clear all downloads" with confirmation); app version display; all changes call corresponding store setters and persist immediately
  - _Requirements: 28.1–28.6, 16.3, 17.1–17.3, 23.1, 21.6, 29.3, 29.4_

- [x] 30. Downloads management screen
  - Implement `app/downloads.tsx`: active downloads list with progress bars, queued count, completed count, total storage used; cancel individual download button; pause/resume entire queue button; "Download all pages" button (calls `enqueueAll`, skips already downloaded); accessible from Settings
  - _Requirements: 31.2, 31.4, 31.7, 31.8_

- [x] 31. Checkpoint — wire everything together in Page Screen
  - Ensure `app/page/[pageNumber].tsx` composes: `PageHeader` (full-screen, lock, bookmark), `MushafText` or `MushafImage` (based on `mushafImageMode`), `AudioPlayer`, `DownloadButton`, `OfflineBanner`, swipe gesture wrapper, font-size slider
  - Verify navigation from all three browsers (Juz, Surah, Page) reaches the same `[pageNumber].tsx` component
  - Verify `setLastReadPage` debounce and Home screen resume prompt work end-to-end
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 7.1–7.11, 15.1–15.5_

- [x] 32. Property-based tests (fast-check, all 11 properties)
  - [x] 32.1 Set up Jest/Vitest with fast-check; create test directories `src/features/quran/__tests__/`, `src/features/audio/__tests__/`, `src/features/download/__tests__/`, `src/store/__tests__/`, `src/features/search/__tests__/`
    - _Requirements: testing infrastructure_
  - [x]* 32.2 Property 1 — Metadata completeness: `fc.integer({min:1,max:604})` → `getPageMetadata(n)` fields all valid
    - **Property 1: Metadata completeness and validity**
    - **Validates: Requirements 2.2, 2.3**
  - [x]* 32.3 Property 2 — Juz partition covers all pages: `fc.integer({min:1,max:30})` → `getPagesByJuz(j)` all have correct juz; union of all 30 = exactly 604 distinct pages
    - **Property 2: Juz partition covers all pages**
    - **Validates: Requirements 2.4**
  - [x]* 32.4 Property 3 — Audio source resolution exhaustive: `fc.integer({min:1,max:604})` × `fc.set(fc.integer({min:1,max:604}))` × `fc.string()` → exactly one of bundled/local/remote/null returned per the priority rules
    - **Property 3: Audio source resolution is exhaustive and correct**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.6**
  - [x]* 32.5 Property 4 — Download path correctness: `fc.integer({min:1,max:604})` → computed path equals `{documentDirectory}audio/lq/{n}.mp3`
    - **Property 4: Download path correctness**
    - **Validates: Requirements 10.4**
  - [x]* 32.6 Property 5 — Download concurrency invariant: arbitrary sequences of `enqueueDownload` calls → `queue.filter(i => i.status === 'downloading').length <= MAX_CONCURRENT_DOWNLOADS`
    - **Property 5: Download concurrency invariant**
    - **Validates: Requirements 10.9**
  - [x]* 32.7 Property 6 — Downloaded pages persistence round-trip: `fc.set(fc.integer({min:1,max:604}))` → serialize to JSON and back → same set
    - **Property 6: Downloaded pages persistence round-trip**
    - **Validates: Requirements 11.1**
  - [x]* 32.8 Property 7 — Playback speed state consistency: `fc.constantFrom(0.75,1.0,1.25,1.5,2.0)` → `setPlaybackSpeed(v)` → `store.audio.playbackSpeed === v`
    - **Property 7: Playback speed state consistency**
    - **Validates: Requirements 21.1**
  - [x]* 32.9 Property 8 — Bookmark add/remove round-trip: `fc.integer({min:1,max:604})` × `fc.string({maxLength:60})` → add → `isBookmarked` true → remove → `isBookmarked` false
    - **Property 8: Bookmark add/remove round-trip**
    - **Validates: Requirements 26.2, 26.3**
  - [x]* 32.10 Property 9 — Bookmark count invariant: arbitrary sequence of `addBookmark` calls → `bookmarks.length <= MAX_BOOKMARKS`
    - **Property 9: Bookmark count invariant**
    - **Validates: Requirements 26.9**
  - [x]* 32.11 Property 10 — Surah search completeness: `fc.integer({min:1,max:114})` → pick surah, take substring of name → `searchSurahs(substring)` includes that surah
    - **Property 10: Surah search completeness**
    - **Validates: Requirements 27.3**
  - [x]* 32.12 Property 11 — Page number search correctness: `fc.integer({min:1,max:604})` → `search(String(n))` includes result with `type === 'page'` and `pageNumber === n`
    - **Property 11: Page number search correctness**
    - **Validates: Requirements 27.4**

- [x] 33. Final integration and polish
  - [x] 33.1 Verify all 5 navigation paths reach `[pageNumber].tsx` correctly (Juz list, Surah list, Page browser, Home resume, Search result)
    - _Requirements: 4.3, 5.3, 6.3, 15.3, 27.7_
  - [x] 33.2 Verify theme switching updates Page Screen immediately without restart; verify font size slider updates in real time
    - _Requirements: 16.3, 17.2_
  - [x] 33.3 Verify RTL layout applies correctly when Arabic UI language is selected
    - _Requirements: 29.5_
  - [x] 33.4 Verify `OfflineBanner` appears/disappears correctly and download queue pauses/resumes on connectivity change
    - _Requirements: 30.4, 30.5_
  - [x] 33.5 Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The design document is the authoritative source for all interfaces, data shapes, and algorithms — do not re-derive them
- Property tests use fast-check with a minimum of 100 iterations per property
- All code is TypeScript strict mode; no `any` except where expo-av types require it
- `resolveAudioSource` must remain a pure function with no side effects
- The Zustand store's `persist` middleware handles all AsyncStorage I/O — do not write to AsyncStorage directly from components
