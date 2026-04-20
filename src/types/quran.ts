export interface PageMetadata {
    pageNumber: number;           // 1–604
    juzNumber: number;            // 1–30
    surahNumber: number;          // 1–114
    surahNameArabic: string;
    surahNameEnglish: string;
    startAyah: number;
    endAyah: number;
    isFirstPageOfSurah: boolean;
    hasBasmala: boolean;          // false for Surah 9 first page
}

export interface SurahInfo {
    surahNumber: number;          // 1–114
    nameArabic: string;
    nameEnglish: string;
    totalAyahs: number;
    startPage: number;
}

export interface JuzInfo {
    juzNumber: number;            // 1–30
    startPage: number;
    startSurahNameArabic: string;
    startSurahNameEnglish: string;
}

// Extended page data — includes optional future fields (Req 13)
export interface PageData extends PageMetadata {
    tafsirText?: string;
    recitationAudioUrl?: string;
    bookmarkId?: string | null;
}

/**
 * Per-page layout data extracted from the Dar al-Maarifah Mushaf .docx files.
 * Each line is a string of QPC font codepoints rendered with the page font.
 */
export interface PageLayout {
    pageNumber: number;
    lines: string[];      // QPC-encoded lines — must use page font to render
    fontName: string;     // expo-font key, e.g. "QPC_P1"
}
