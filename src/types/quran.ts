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
