/**
 * quranWordIndex.ts
 *
 * Indexes the QPC word-by-word Quran data for fast lookup.
 *
 * The raw JSON has keys like "1:1:1" (surah:ayah:word) and values:
 *   { id, surah, ayah, word, location, text }
 *
 * The `text` field contains QPC private-use-area codepoints that render
 * correctly ONLY with the matching per-page font (p{pageNumber}.ttf).
 *
 * This module provides:
 *   - getWord(surah, ayah, word)  → single word entry
 *   - getAyahWords(surah, ayah)   → ordered array of words for an ayah
 *   - getPageWords(pageNumber)    → all words on a page (via page metadata)
 */

// The raw JSON is ~7.8 MB — import lazily to avoid blocking startup.
// In production, consider splitting by surah or using a SQLite/MMKV store.
let _data: Record<string, QuranWord> | null = null;

export interface QuranWord {
    id: number;
    surah: string;
    ayah: string;
    word: string;
    location: string; // "surah:ayah:word"
    text: string;     // QPC font codepoints — render with page font only
}

function getData(): Record<string, QuranWord> {
    if (!_data) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        _data = require('../../quran-word-by-word-qpc-v4.json') as Record<string, QuranWord>;
    }
    return _data;
}

/**
 * Returns a single word entry by surah, ayah, word position (all 1-based).
 */
export function getWord(
    surah: number,
    ayah: number,
    wordPos: number,
): QuranWord | undefined {
    return getData()[`${surah}:${ayah}:${wordPos}`];
}

/**
 * Returns all words for a given ayah in order.
 */
export function getAyahWords(surah: number, ayah: number): QuranWord[] {
    const data = getData();
    const words: QuranWord[] = [];
    let pos = 1;
    while (true) {
        const key = `${surah}:${ayah}:${pos}`;
        if (!data[key]) break;
        words.push(data[key]);
        pos++;
    }
    return words;
}

/**
 * Returns all words for a range of ayahs (used to populate a page).
 * Pass the surah number, start ayah, and end ayah from PageMetadata.
 */
export function getAyahRangeWords(
    surah: number,
    startAyah: number,
    endAyah: number,
): QuranWord[] {
    const words: QuranWord[] = [];
    for (let ayah = startAyah; ayah <= endAyah; ayah++) {
        words.push(...getAyahWords(surah, ayah));
    }
    return words;
}
