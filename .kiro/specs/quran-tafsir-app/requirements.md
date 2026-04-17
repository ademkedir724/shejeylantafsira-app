# Requirements Document

## Introduction

A production-grade Qur'an mobile application (Android + iOS) built with React Native (Expo Router) that delivers page-by-page tafsir audio in Afaan Oromo by Sheikh Jeylan. The app binary is kept under 30MB by hosting all 604 audio files on Cloudflare R2 remote storage — only 3 sample pages (1, 2, and 604) are bundled inside the app so users can immediately hear Sheikh Jeylan's voice before downloading anything. All other pages stream from R2 by default and can be downloaded individually or by juz for offline use. The app renders Mushaf Tajweed Arabic text (color-coded, text-based, not images) and allows users to browse all 604 Qur'an pages via three interconnected navigation systems: Juz, Surah, and Page. The app also supports a Mushaf image page layout mode (pixel-perfect scanned pages), multiple reading themes, adjustable font size, page-turn swipe gestures, full-screen reading, bookmarks, search, background audio with lock screen controls, playback speed, sleep timer, auto-advance, and advanced download management. The architecture is modular and extensible to support future features such as tafsir text, Qur'an recitation audio, and full-text search.

---

## Glossary

- **App**: The React Native / Expo Router Qur'an tafsir mobile application.
- **Page**: A single Qur'an mushaf page, numbered 1–604.
- **Tafsir_Audio**: An MP3 audio file containing Sheikh Jeylan's Afaan Oromo tafsir explanation for a specific Page.
- **HQ_Audio**: High-quality MP3 file hosted on Cloudflare R2 remote storage, used for online streaming for all non-sample pages.
- **LQ_Audio**: Low-quality MP3 file used for offline playback; either bundled as a sample or downloaded from Cloudflare R2.
- **Remote_Storage**: Cloudflare R2 bucket hosting all 604 LQ and HQ audio files, accessible via predictable URLs in the format `https://{bucket}/lq/{pageNumber}.mp3` and `https://{bucket}/hq/{pageNumber}.mp3`.
- **Sample_Pages**: Pages 1, 2, and 604 whose LQ_Audio files are shipped inside the app binary (~4MB total) so users can hear the tafsir immediately after install without downloading anything.
- **Downloadable_Pages**: All 604 pages whose LQ_Audio files can be downloaded from Remote_Storage for offline playback. Sample_Pages can also be re-downloaded if needed but are already available offline.
- **Audio_Engine**: The module responsible for loading, playing, pausing, seeking, and releasing audio resources.
- **Download_Manager**: The module responsible for downloading LQ_Audio files, tracking progress, and persisting download state.
- **Page_Screen**: The primary screen that displays Mushaf Tajweed text, page metadata, and the Audio_Engine controls for a given Page.
- **Juz**: One of 30 equal divisions of the Qur'an.
- **Surah**: One of 114 chapters of the Qur'an.
- **Mushaf_Tajweed**: Color-coded Arabic Qur'an text rendered as Unicode text (not images) that visually encodes tajweed rules via color.
- **Metadata**: Per-page structured data including Page number, Surah name (Arabic + English), ayah range, and Juz number, sourced from the CSV metadata pipeline.
- **Storage**: AsyncStorage used to persist download state and user preferences.
- **Navigation_System**: The three interconnected browsing modes — Juz, Surah, and Page — all resolving to the Page_Screen.
- **Mushaf_Image_Mode**: An alternative page rendering mode that displays a high-fidelity scanned image of the Mushaf page (one image per page, 1–604) preserving the exact printed layout without any text distortion.
- **Reading_Theme**: A visual mode applied to the Page_Screen background and text colors. Supported themes: Light, Dark, Sepia, Paper.
- **Sleep_Timer**: A countdown timer that automatically pauses audio playback after a user-defined duration.
- **Auto_Advance**: A setting that causes the app to automatically navigate to the next page and begin audio playback when the current page's audio finishes.
- **Bulk_Download**: A download operation that enqueues all Downloadable_Pages within a Juz or the entire Qur'an for sequential download.
- **Download_Queue**: An ordered list of pages pending download, supporting pause, resume, and cancel operations.
- **Last_Read_Page**: The page number of the most recently viewed Page_Screen, persisted across app sessions.
- **Lock_Screen_Controls**: Media playback controls (play, pause, next, previous) displayed on the device lock screen and in the system notification tray via the OS media session API.

---

## Requirements

### Requirement 1: Project Foundation and Folder Structure

**User Story:** As a developer, I want a clean, scalable folder structure, so that the codebase remains maintainable and extensible as new features are added.

#### Acceptance Criteria

1. THE App SHALL organize source code into the following top-level directories: `app/` (Expo Router screens and layouts), `src/components/` (shared UI components), `src/features/` (feature modules: audio, download, navigation, quran), `src/store/` (Zustand stores), `src/hooks/` (custom React hooks), `src/constants/` (theme, config, static data), `src/types/` (TypeScript interfaces and types), and `assets/audio/samples/` (3 bundled sample LQ audio files for pages 1, 2, and 604).
2. THE App SHALL use TypeScript strict mode for all source files.
3. THE App SHALL define path aliases (e.g., `@/`) so that imports do not use relative `../` chains longer than one level.
4. WHEN a new feature module is added, THE App SHALL require no changes to existing feature modules to accommodate it.

---

### Requirement 2: Qur'an Metadata

**User Story:** As a developer, I want structured per-page metadata available at runtime, so that the Page_Screen can display accurate surah names, ayah ranges, and juz numbers.

#### Acceptance Criteria

1. THE App SHALL ship a static TypeScript data file derived from the CSV metadata pipeline containing an entry for every Page (1–604).
2. THE Metadata entry for each Page SHALL include: page number (integer 1–604), surah name in Arabic, surah name in English, starting ayah number, ending ayah number, and juz number (integer 1–30).
3. WHEN a Page number is provided, THE App SHALL return the corresponding Metadata entry in O(1) time using an indexed lookup.
4. THE App SHALL expose helper functions to retrieve all Pages belonging to a given Juz and all Pages belonging to a given Surah.
5. THE App SHALL expose a list of all 114 Surahs with their names (Arabic + English), total ayah count, and starting page number.
6. THE App SHALL expose a list of all 30 Juz with their starting page number and starting surah name.

---

### Requirement 3: Mushaf Tajweed Text Rendering

**User Story:** As a user, I want to read the Qur'an in Mushaf Tajweed format, so that I can follow the text with proper tajweed color cues while listening to tafsir.

#### Acceptance Criteria

1. THE Page_Screen SHALL render Mushaf Tajweed Arabic text as Unicode text (not images) for the current Page.
2. THE App SHALL use a Mushaf-compatible Arabic font (e.g., KFGQPC Uthmanic Script or equivalent) loaded via expo-font.
3. THE Mushaf_Tajweed text SHALL apply color coding to Arabic characters to reflect tajweed rules (e.g., ghunna, madd, qalqala) using inline text styles.
4. THE Page_Screen SHALL display text in a right-to-left layout matching the Mushaf page format.
5. WHEN the Page_Screen renders, THE Mushaf_Tajweed text SHALL be fully visible without horizontal scrolling.
6. THE Page_Screen SHALL display the Basmala at the top of each surah's first page, except for Surah At-Tawbah (Surah 9).

---

### Requirement 4: Navigation System — Juz Browser

**User Story:** As a user, I want to browse the Qur'an by Juz, so that I can quickly navigate to any of the 30 divisions.

#### Acceptance Criteria

1. THE App SHALL provide a Juz list screen displaying all 30 Juz entries.
2. EACH Juz entry SHALL display: Juz number, starting surah name (Arabic + English), and starting page number.
3. WHEN a user selects a Juz entry, THE App SHALL navigate to the Page_Screen for the first page of that Juz.
4. WHILE the user is on the Page_Screen, THE App SHALL allow the user to navigate to the next page within the same Juz until the last page of that Juz is reached.
5. WHEN the user reaches the last page of a Juz and navigates forward, THE App SHALL transition seamlessly to the first page of the next Juz.

---

### Requirement 5: Navigation System — Surah Browser

**User Story:** As a user, I want to browse the Qur'an by Surah, so that I can jump directly to any of the 114 chapters.

#### Acceptance Criteria

1. THE App SHALL provide a Surah list screen displaying all 114 Surahs.
2. EACH Surah entry SHALL display: surah number, surah name in Arabic, surah name in English, total ayah count, and starting page number.
3. WHEN a user selects a Surah entry, THE App SHALL navigate to the Page_Screen for the first page of that Surah.
4. WHEN the user is on the last page of a Surah and navigates forward, THE App SHALL transition seamlessly to the first page of the next Surah.
5. IF the user is on the last page of Surah 114, THEN THE App SHALL disable the forward navigation control.

---

### Requirement 6: Navigation System — Page Browser

**User Story:** As a user, I want to browse all 604 pages directly, so that I can jump to any specific page number.

#### Acceptance Criteria

1. THE App SHALL provide a Page list screen displaying all 604 pages.
2. EACH Page entry SHALL display: page number, surah name, and juz number.
3. WHEN a user selects a Page entry, THE App SHALL navigate to the Page_Screen for that Page.
4. THE App SHALL provide a numeric input or scroll mechanism allowing the user to jump directly to any page number between 1 and 604.
5. IF the user enters a page number outside the range 1–604, THEN THE App SHALL display a validation message and retain the current page.

---

### Requirement 7: Page Screen

**User Story:** As a user, I want a single unified page screen that shows the Mushaf text and tafsir audio controls, so that I have everything I need in one place.

#### Acceptance Criteria

1. THE Page_Screen SHALL display the Mushaf_Tajweed text for the current Page.
2. THE Page_Screen SHALL display the surah name in Arabic and English for the current Page.
3. THE Page_Screen SHALL display the ayah range (start ayah – end ayah) for the current Page.
4. THE Page_Screen SHALL display the Juz number for the current Page.
5. THE Page_Screen SHALL display the Audio_Engine controls for the Tafsir_Audio of the current Page.
6. THE Page_Screen SHALL provide a "previous page" control that navigates to Page (current − 1).
7. THE Page_Screen SHALL provide a "next page" control that navigates to Page (current + 1).
8. IF the current Page is 1, THEN THE Page_Screen SHALL disable the "previous page" control.
9. IF the current Page is 604, THEN THE Page_Screen SHALL disable the "next page" control.
10. WHEN the user navigates to a new Page, THE Audio_Engine SHALL stop any currently playing audio before loading the new page's audio.
11. THE Page_Screen SHALL be reachable from the Juz list screen, the Surah list screen, and the Page list screen using the same screen component.

---

### Requirement 8: Audio Engine

**User Story:** As a user, I want to play, pause, and seek through the tafsir audio for each page, so that I can follow along at my own pace.

#### Acceptance Criteria

1. THE Audio_Engine SHALL support play, pause, and seek operations for Tafsir_Audio.
2. WHEN the user presses play, THE Audio_Engine SHALL begin playback from the current position.
3. WHEN the user presses pause, THE Audio_Engine SHALL pause playback and retain the current position.
4. WHEN the user seeks to a position, THE Audio_Engine SHALL resume playback from that position.
5. THE Audio_Engine SHALL display a progress bar showing elapsed time and total duration.
6. THE Audio_Engine SHALL display elapsed time and total duration as formatted strings (MM:SS).
7. WHEN audio playback completes, THE Audio_Engine SHALL reset the progress bar to the beginning.
8. WHEN the Page_Screen unmounts, THE Audio_Engine SHALL release all audio resources to prevent memory leaks.
9. THE Audio_Engine SHALL use expo-av for all audio operations.
10. WHEN the device is in silent mode (iOS), THE Audio_Engine SHALL still play audio by setting the audio session category to allow playback.

---

### Requirement 9: Audio Source Resolution

**User Story:** As a user, I want the app to automatically play the best available audio source for each page, so that I always hear tafsir without manual configuration.

#### Acceptance Criteria

1. WHEN the user opens a Sample_Page (Page 1, 2, or 604), THE Audio_Engine SHALL load the LQ_Audio from the app's bundled sample assets without any network request.
2. WHEN the user opens any page that has been downloaded to local storage, THE Audio_Engine SHALL load the LQ_Audio from the local file system.
3. WHEN the user opens any page that is not a Sample_Page and has not been downloaded, THE Audio_Engine SHALL stream the HQ_Audio from the Remote_Storage URL.
4. THE App SHALL resolve the correct audio source for a given Page in a single function call (`resolveAudioSource(pageNumber)`) that returns one of: a bundled asset reference, a local file URI, or a remote HQ URL string.
5. THE remote URL pattern SHALL be configurable in a single constants file (`src/constants/config.ts`) so that the R2 bucket URL can be updated without touching any other file.
6. WHEN the Remote_Storage base URL is not yet configured (empty string), THE App SHALL display an "Audio coming soon" placeholder in the Audio_Engine controls instead of attempting a network request.
7. THE App SHALL display a "Sample" badge on the audio player for Sample_Pages (1, 2, 604) to indicate these are bundled preview files.

---

### Requirement 10: Download Manager

**User Story:** As a user, I want to download tafsir audio for offline listening, so that I can use the app without an internet connection.

#### Acceptance Criteria

1. THE Page_Screen SHALL display a "Download for offline" button for any page that has not yet been downloaded to local storage (including Sample_Pages, which are already available but can still be explicitly downloaded as LQ).
2. WHEN the user taps "Download for offline", THE Download_Manager SHALL begin downloading the LQ_Audio file from Remote_Storage for that Page.
3. WHILE a download is in progress, THE Page_Screen SHALL display a progress indicator showing the download percentage.
4. WHEN a download completes successfully, THE Download_Manager SHALL save the LQ_Audio file to the device's local file system using expo-file-system at path `{documentDirectory}/audio/lq/{pageNumber}.mp3`.
5. WHEN a download completes successfully, THE Download_Manager SHALL record the Page number as downloaded in Storage.
6. WHEN a download fails, THE Download_Manager SHALL display an error message and allow the user to retry.
7. THE Download_Manager SHALL support cancelling an in-progress download.
8. WHEN the app restarts, THE Download_Manager SHALL restore the list of downloaded pages from Storage.
9. THE App SHALL allow downloading multiple pages concurrently, up to a maximum of 3 simultaneous downloads.
10. WHEN a downloaded page's audio file is deleted from the file system externally, THE Download_Manager SHALL detect the missing file on next access and update Storage to mark the page as not downloaded.

---

### Requirement 11: Offline Storage Tracking

**User Story:** As a developer, I want all download state persisted in AsyncStorage, so that the app correctly reflects download status across sessions.

#### Acceptance Criteria

1. THE Storage module SHALL persist the set of downloaded page numbers as a JSON array in AsyncStorage under a defined key.
2. WHEN the app launches, THE Storage module SHALL load the downloaded pages list from AsyncStorage before the Page_Screen is rendered.
3. WHEN a page is downloaded, THE Storage module SHALL add the page number to the persisted list within 500ms of download completion.
4. WHEN a page's local file is confirmed missing, THE Storage module SHALL remove the page number from the persisted list.
5. THE Storage module SHALL expose a Zustand store slice that components can subscribe to for reactive download state updates.

---

### Requirement 12: State Management

**User Story:** As a developer, I want a centralized Zustand store, so that audio state, download state, and navigation state are consistent across all screens.

#### Acceptance Criteria

1. THE App SHALL use Zustand for all global state management.
2. THE App SHALL define a separate Zustand store slice for: audio playback state, download state, and current page/navigation state.
3. WHEN the Audio_Engine state changes (playing, paused, position, duration), THE corresponding Zustand slice SHALL be updated synchronously.
4. WHEN the Download_Manager state changes (progress, completion, error), THE corresponding Zustand slice SHALL be updated synchronously.
5. THE App SHALL not use React Context or Redux for state that is already managed by Zustand.

---

### Requirement 13: Extensibility — Future Feature Hooks

**User Story:** As a developer, I want the architecture to support future features without refactoring existing modules, so that the app can grow without technical debt.

#### Acceptance Criteria

1. THE App SHALL define a TypeScript interface `PageData` that includes optional fields for: `tafsirText` (string), `recitationAudioUrl` (string), and `bookmarkId` (string or null), in addition to the current required fields.
2. THE App SHALL define a TypeScript interface `UserPreferences` that includes optional fields for: `fontSize` (number), `theme` ('light' | 'dark' | 'sepia'), and `lastReadPage` (number).
3. THE Zustand store SHALL include a `bookmarks` slice stub with `addBookmark`, `removeBookmark`, and `isBookmarked` actions, even if the UI for bookmarks is not yet implemented.
4. THE App SHALL include a `search` feature directory stub under `src/features/search/` with an empty index file and a README describing the intended search interface.
5. WHERE the Surah list screen is implemented, THE App SHALL reserve a UI slot (commented placeholder) for a future search bar component.

---

### Requirement 14: UI Design

**User Story:** As a user, I want a beautiful, modern, and culturally appropriate UI, so that the app feels professional and respectful of the Qur'anic content.

#### Acceptance Criteria

1. THE App SHALL implement a consistent design system with a defined color palette, typography scale, and spacing constants in `src/constants/theme.ts`.
2. THE App SHALL support both light and dark color schemes using React Native's `useColorScheme` hook.
3. THE App SHALL use a primary color palette inspired by Islamic art (e.g., deep greens, golds, and creams) for light mode, and deep navy/charcoal with gold accents for dark mode.
4. THE App SHALL display Arabic text using a minimum font size of 20sp to ensure readability.
5. THE App SHALL use smooth animated transitions between screens via React Navigation's default stack animation.
6. THE Page_Screen audio player SHALL be styled as a card component with rounded corners, shadow, and clear iconography for play/pause/seek controls.
7. THE App SHALL display loading states (skeleton or spinner) while Metadata or audio is being resolved.
8. THE App SHALL be fully usable on screen sizes from 360dp width (small Android) to 430dp width (large iPhone).

---

### Requirement 15: Last Read Page — Auto-Save and Resume

**User Story:** As a user, I want the app to remember where I left off, so that I can resume reading without searching for my page.

#### Acceptance Criteria

1. WHEN the user navigates to any Page_Screen, THE App SHALL persist the current page number as Last_Read_Page in Storage within 1 second.
2. WHEN the app launches, THE App SHALL read Last_Read_Page from Storage and display a "Resume from page X" prompt on the home screen.
3. WHEN the user taps "Resume", THE App SHALL navigate directly to the Last_Read_Page.
4. IF no Last_Read_Page exists in Storage, THE App SHALL not display the resume prompt.
5. THE Last_Read_Page SHALL be stored in the UserPreferences Zustand slice and persisted via AsyncStorage.

---

### Requirement 16: Reading Themes

**User Story:** As a user, I want to choose a reading theme, so that I can read comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL support four Reading_Themes: Light, Dark, Sepia, and Paper.
2. THE Page_Screen SHALL apply the active Reading_Theme to the background color, Arabic text color, and UI chrome colors.
3. WHEN the user changes the Reading_Theme in Settings, THE Page_Screen SHALL update immediately without requiring a restart.
4. THE active Reading_Theme SHALL be persisted in Storage and restored on next app launch.
5. THE Light theme SHALL use a white background with dark text. The Dark theme SHALL use a deep navy/charcoal background with light text and gold accents. The Sepia theme SHALL use a warm amber/tan background with dark brown text. The Paper theme SHALL use an off-white parchment background with near-black text.
6. THE Reading_Theme setting SHALL override the system-level light/dark mode preference.

---

### Requirement 17: Adjustable Arabic Font Size and Mushaf Image Mode

**User Story:** As a user, I want to adjust the Arabic text size or switch to a pixel-perfect Mushaf image layout, so that I can read in the format most comfortable for me.

#### Acceptance Criteria

1. THE Page_Screen SHALL provide a font size slider allowing the user to adjust the Arabic text size from 16sp to 36sp in increments of 2sp.
2. WHEN the user adjusts the font size slider, THE Page_Screen SHALL update the Arabic text size in real time without re-navigation.
3. THE selected font size SHALL be persisted in Storage and restored on next app launch.
4. THE Page_Screen SHALL provide a toggle to switch between Text Mode (Mushaf_Tajweed Unicode rendering) and Mushaf_Image_Mode.
5. WHEN Mushaf_Image_Mode is active, THE Page_Screen SHALL display the scanned Mushaf page image for the current page number, scaled to fill the screen width while maintaining the original aspect ratio.
6. WHEN Mushaf_Image_Mode is active, THE font size slider SHALL be disabled (images are not resizable).
7. THE Mushaf page images SHALL be stored in `assets/pages/` named `{pageNumber}.png` (or `.jpg`), one file per page.
8. WHEN a Mushaf page image is not found for the current page, THE App SHALL fall back to Text Mode and display a notice to the user.

---

### Requirement 18: Full-Screen Reading Mode

**User Story:** As a user, I want to hide all UI chrome while reading, so that I can focus entirely on the Qur'anic text.

#### Acceptance Criteria

1. THE Page_Screen SHALL provide a full-screen toggle button (e.g., expand icon in the top corner).
2. WHEN full-screen mode is activated, THE App SHALL hide the navigation header, tab bar, audio player card, and all overlay controls.
3. WHEN full-screen mode is activated, THE App SHALL hide the device status bar.
4. WHEN the user taps the screen in full-screen mode, THE App SHALL briefly show the navigation controls for 3 seconds before hiding them again.
5. WHEN the user taps the full-screen toggle again, THE App SHALL exit full-screen mode and restore all UI elements.
6. WHEN full-screen mode is active and audio is playing, THE audio SHALL continue uninterrupted.

---

### Requirement 19: Page Turn Swipe Gesture

**User Story:** As a user, I want to swipe left and right to turn pages, so that navigation feels natural like reading a real book.

#### Acceptance Criteria

1. THE Page_Screen SHALL support a horizontal swipe-left gesture to navigate to the next page (page + 1).
2. THE Page_Screen SHALL support a horizontal swipe-right gesture to navigate to the previous page (page − 1).
3. THE swipe gesture SHALL trigger a page-turn animation (slide or curl) that visually mimics turning a book page.
4. WHEN the user swipes on page 1 to the right, THE App SHALL not navigate and SHALL show a subtle bounce-back animation.
5. WHEN the user swipes on page 604 to the left, THE App SHALL not navigate and SHALL show a subtle bounce-back animation.
6. THE swipe gesture SHALL coexist with vertical scrolling on the Page_Screen without conflict.

---

### Requirement 20: Lock Screen to Current Page

**User Story:** As a user, I want to lock the screen to the current page while listening, so that I don't accidentally navigate away.

#### Acceptance Criteria

1. THE Page_Screen SHALL provide a "Lock Page" toggle button.
2. WHEN Page Lock is active, THE App SHALL disable all page navigation controls (previous/next buttons, swipe gestures, and browser list navigation).
3. WHEN Page Lock is active, THE App SHALL display a visible lock indicator (e.g., padlock icon) on the Page_Screen.
4. WHEN Page Lock is active, THE audio controls (play/pause/seek) SHALL remain fully functional.
5. WHEN the user taps the lock indicator, THE App SHALL deactivate Page Lock and re-enable navigation.
6. THE Page Lock state SHALL not persist across app sessions (always starts unlocked).

---

### Requirement 21: Playback Speed Control

**User Story:** As a user, I want to control the playback speed of the tafsir audio, so that I can listen at a pace that suits my comprehension.

#### Acceptance Criteria

1. THE Audio_Engine SHALL support playback speed values: 0.75x, 1.0x, 1.25x, 1.5x, and 2.0x.
2. THE Page_Screen audio player SHALL display a speed control button showing the current speed (e.g., "1.0x").
3. WHEN the user taps the speed button, THE App SHALL display a picker or bottom sheet with the five speed options.
4. WHEN the user selects a speed, THE Audio_Engine SHALL apply the new speed to the currently loaded audio immediately without restarting playback.
5. THE selected playback speed SHALL persist across page navigations within the same session.
6. THE selected playback speed SHALL be persisted in Storage and restored on next app launch.

---

### Requirement 22: Sleep Timer

**User Story:** As a user, I want to set a sleep timer, so that audio stops automatically when I fall asleep.

#### Acceptance Criteria

1. THE App SHALL provide a Sleep_Timer control accessible from the audio player or Settings screen.
2. THE Sleep_Timer SHALL support the following durations: 5, 10, 15, 30, 45, 60 minutes, and "End of current page".
3. WHEN the user sets a Sleep_Timer, THE App SHALL display a countdown indicator showing remaining time.
4. WHEN the Sleep_Timer reaches zero, THE Audio_Engine SHALL pause playback.
5. WHEN the Sleep_Timer reaches zero, THE App SHALL display a brief notification: "Sleep timer ended".
6. THE user SHALL be able to cancel the Sleep_Timer at any time before it expires.
7. THE Sleep_Timer SHALL not persist across app sessions (resets on app restart).

---

### Requirement 23: Auto-Advance to Next Page

**User Story:** As a user, I want the app to automatically move to the next page when audio finishes, so that I can listen continuously without interaction.

#### Acceptance Criteria

1. THE App SHALL provide an Auto_Advance toggle in the audio player controls and in Settings.
2. WHEN Auto_Advance is enabled and the current page's audio playback completes, THE App SHALL automatically navigate to the next page (page + 1).
3. WHEN Auto_Advance navigates to the next page, THE Audio_Engine SHALL automatically begin playback of the new page's audio after a 1-second delay.
4. WHEN Auto_Advance is enabled and the current page is 604, THE App SHALL not navigate further and SHALL disable Auto_Advance.
5. WHEN a Sleep_Timer is active and Auto_Advance triggers, THE Sleep_Timer countdown SHALL continue unaffected.
6. THE Auto_Advance state SHALL be persisted in Storage and restored on next app launch.

---

### Requirement 24: Background Audio and Lock Screen Controls

**User Story:** As a user, I want tafsir audio to continue playing when I lock my phone or switch apps, so that I can listen while doing other things.

#### Acceptance Criteria

1. THE Audio_Engine SHALL continue playing audio when the app moves to the background.
2. THE Audio_Engine SHALL continue playing audio when the device screen is locked.
3. THE App SHALL register a media session with the OS so that Lock_Screen_Controls are displayed on the lock screen and in the notification tray.
4. THE Lock_Screen_Controls SHALL include: play/pause, skip to next page, skip to previous page, and display the current surah name and page number as the track title.
5. WHEN the user taps play/pause on the Lock_Screen_Controls, THE Audio_Engine SHALL respond immediately.
6. WHEN the user taps next/previous on the Lock_Screen_Controls, THE App SHALL navigate to the corresponding page and begin playback.
7. THE App SHALL use expo-av's audio mode configuration to enable background audio on both iOS and Android.

---

### Requirement 25: Repeat / Loop Mode

**User Story:** As a user, I want to loop the current page's audio, so that I can repeatedly listen to a tafsir explanation.

#### Acceptance Criteria

1. THE audio player SHALL provide a Repeat toggle button.
2. WHEN Repeat is enabled, THE Audio_Engine SHALL restart the current page's audio from the beginning when playback completes, instead of stopping or auto-advancing.
3. WHEN Repeat is enabled, Auto_Advance SHALL be suspended for the current page.
4. THE Repeat toggle SHALL display a visual indicator (e.g., highlighted loop icon) when active.
5. THE Repeat state SHALL persist across page navigations within the same session but SHALL reset when the app restarts.

---

### Requirement 26: Bookmarks

**User Story:** As a user, I want to bookmark pages with a label, so that I can quickly return to important pages.

#### Acceptance Criteria

1. THE Page_Screen SHALL display a bookmark icon button in the header.
2. WHEN the user taps the bookmark icon on an unbookmarked page, THE App SHALL prompt the user to enter an optional label (max 60 characters) and save the bookmark.
3. WHEN the user taps the bookmark icon on an already-bookmarked page, THE App SHALL prompt the user to confirm removal of the bookmark.
4. THE bookmark icon SHALL visually indicate whether the current page is bookmarked (filled vs. outline icon).
5. THE App SHALL provide a Bookmarks list screen accessible from the main navigation, displaying all saved bookmarks with: page number, surah name, juz number, user label, and date saved.
6. WHEN the user taps a bookmark entry, THE App SHALL navigate to the corresponding Page_Screen.
7. THE user SHALL be able to delete a bookmark from the Bookmarks list screen by swiping or long-pressing.
8. ALL bookmarks SHALL be persisted in Storage and restored on next app launch.
9. THE App SHALL support a maximum of 200 bookmarks. WHEN the limit is reached, THE App SHALL notify the user and prevent adding more until existing bookmarks are removed.

---

### Requirement 27: Search

**User Story:** As a user, I want to search for a surah, page, or juz by name or number, so that I can navigate quickly without scrolling through lists.

#### Acceptance Criteria

1. THE App SHALL provide a Search screen accessible from the main navigation tab bar.
2. THE Search screen SHALL include a text input field that filters results as the user types.
3. WHEN the user types a surah name (partial match, Arabic or English), THE Search screen SHALL display matching Surah entries.
4. WHEN the user types a number between 1 and 604, THE Search screen SHALL display a "Go to page X" result.
5. WHEN the user types a number between 1 and 30, THE Search screen SHALL display a "Go to Juz X" result in addition to any page match.
6. WHEN the user types a number between 1 and 114, THE Search screen SHALL display a "Go to Surah X" result in addition to other matches.
7. WHEN the user selects any search result, THE App SHALL navigate to the corresponding Page_Screen.
8. THE Search screen SHALL display a "No results found" message when no matches exist.
9. THE Search input SHALL be focused automatically when the Search screen is opened.
10. Future full-text Arabic ayah search SHALL be accommodated by the search module's interface without requiring a redesign (stub interface defined in `src/features/search/`).

---

### Requirement 28: Settings Screen

**User Story:** As a user, I want a dedicated Settings screen, so that I can configure the app's behavior in one place.

#### Acceptance Criteria

1. THE App SHALL provide a Settings screen accessible from the main navigation.
2. THE Settings screen SHALL include controls for: Reading_Theme selection, Arabic font size slider, Mushaf_Image_Mode toggle, Auto_Advance toggle, default playback speed, UI language selection (Afaan Oromo, English, Arabic), and Auto-download on Wi-Fi only toggle.
3. WHEN the user changes any setting, THE App SHALL apply the change immediately and persist it to Storage.
4. THE Settings screen SHALL display a Storage Usage section showing: total downloaded audio size in MB, number of downloaded pages, and a "Clear all downloads" button.
5. WHEN the user taps "Clear all downloads", THE App SHALL prompt for confirmation, then delete all downloaded LQ_Audio files from the file system and clear the downloaded pages list from Storage.
6. THE Settings screen SHALL display the app version number.

---

### Requirement 29: UI Language / Localization

**User Story:** As a user, I want to use the app in Afaan Oromo, English, or Arabic, so that I can interact with the UI in my preferred language.

#### Acceptance Criteria

1. THE App SHALL support three UI languages: Afaan Oromo (default), English, and Arabic.
2. ALL UI strings (button labels, screen titles, messages, prompts) SHALL be defined in a localization file per language under `src/constants/i18n/`.
3. WHEN the user selects a UI language in Settings, THE App SHALL re-render all UI strings in the selected language immediately.
4. THE selected UI language SHALL be persisted in Storage and restored on next app launch.
5. WHEN Arabic is selected as the UI language, THE App SHALL apply RTL layout direction to the entire app.
6. Arabic Qur'anic text (Mushaf content) SHALL always remain in Arabic regardless of the selected UI language.

---

### Requirement 30: Offline Mode Indicator

**User Story:** As a user, I want to know when I'm offline, so that I understand why streaming is unavailable.

#### Acceptance Criteria

1. THE App SHALL monitor network connectivity using a network state hook (e.g., `@react-native-community/netinfo`).
2. WHEN the device has no internet connection, THE App SHALL display a persistent offline banner or icon in the Page_Screen header.
3. WHEN the device is offline and the current page is a Downloadable_Page that has not been downloaded, THE App SHALL disable the stream option and display a message: "No internet connection. Download this page to listen offline."
4. WHEN the device reconnects to the internet, THE App SHALL remove the offline indicator and re-enable streaming automatically.
5. WHEN the device is offline, THE Download_Manager SHALL pause all active downloads and resume them automatically when connectivity is restored.

---

### Requirement 31: Advanced Download Management

**User Story:** As a user, I want full control over my downloads, so that I can manage storage and download entire juz at once.

#### Acceptance Criteria

1. THE App SHALL support a Download_Queue that allows enqueuing multiple pages for sequential download.
2. THE user SHALL be able to pause and resume the entire Download_Queue from the Settings screen or a dedicated Downloads screen.
3. THE App SHALL provide a "Download entire Juz" button on the Juz list screen and Juz detail view, which enqueues all Downloadable_Pages within that Juz.
4. THE App SHALL provide a "Download all pages" option in Settings that enqueues all 604 pages for download (skipping any already downloaded).
5. WHEN "Auto-download on Wi-Fi only" is enabled and the device is on a cellular network, THE Download_Manager SHALL pause all downloads and display a notice.
6. WHEN "Auto-download on Wi-Fi only" is enabled and the device connects to Wi-Fi, THE Download_Manager SHALL automatically resume paused downloads.
7. THE Downloads screen SHALL display: active downloads with progress bars, queued downloads count, completed downloads count, and total storage used.
8. THE user SHALL be able to cancel individual queued or active downloads from the Downloads screen.
