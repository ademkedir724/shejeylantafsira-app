# Search Feature

This module defines the `SearchProvider` interface and the `defaultSearchProvider` implementation.

## Interface

```typescript
export interface SearchProvider {
  search(query: string): SearchResult[];
}
```

The `search` method accepts a query string and returns an array of `SearchResult` objects, each with a `type` (`'page'`, `'juz'`, or `'surah'`), a `pageNumber` to navigate to, a `label`, and an optional `sublabel`.

## Current Implementation

`defaultSearchProvider` performs metadata-only search:

- **Numeric input** — matches page numbers (1–604), juz numbers (1–30), and surah numbers (1–114).
- **Text input** — matches surah names in English and Arabic via `searchSurahs()`.

## Adding Full-Text Arabic Ayah Search

To support full-text search across all Qur'anic ayahs, implement the `SearchProvider` interface with a backend that indexes ayah text. Options include:

- **Fuse.js** — lightweight fuzzy search over a bundled ayah dataset.
- **SQLite (expo-sqlite)** — a bundled SQLite database with FTS5 full-text search.
- **Remote API** — a server-side search endpoint returning `SearchResult[]`.

Swap in the new provider by replacing `defaultSearchProvider` in `app/(tabs)/search.tsx`. No screen changes are required beyond that single import.
