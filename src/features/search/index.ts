import { getAllJuz, getAllSurahs, searchSurahs } from '@/features/quran/index';

export type SearchResultType = 'page' | 'juz' | 'surah';

export interface SearchResult {
    type: SearchResultType;
    pageNumber: number;
    label: string;
    sublabel?: string;
}

export interface SearchProvider {
    search(query: string): SearchResult[];
}

export const defaultSearchProvider: SearchProvider = {
    search(query: string): SearchResult[] {
        const results: SearchResult[] = [];
        const trimmed = query.trim();
        if (!trimmed) return results;

        // Numeric: page, juz, and surah number matches
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && String(num) === trimmed) {
            if (num >= 1 && num <= 604) {
                results.push({ type: 'page', pageNumber: num, label: `Page ${num}` });
            }
            if (num >= 1 && num <= 30) {
                const juz = getAllJuz().find(j => j.juzNumber === num);
                if (juz) {
                    results.push({
                        type: 'juz',
                        pageNumber: juz.startPage,
                        label: `Juz ${num}`,
                        sublabel: juz.startSurahNameEnglish,
                    });
                }
            }
            if (num >= 1 && num <= 114) {
                const surah = getAllSurahs().find(s => s.surahNumber === num);
                if (surah) {
                    results.push({
                        type: 'surah',
                        pageNumber: surah.startPage,
                        label: surah.nameEnglish,
                        sublabel: surah.nameArabic,
                    });
                }
            }
        }

        // Surah name match (Arabic or English)
        const surahMatches = searchSurahs(trimmed);
        for (const s of surahMatches) {
            if (!results.some(r => r.type === 'surah' && r.pageNumber === s.startPage)) {
                results.push({
                    type: 'surah',
                    pageNumber: s.startPage,
                    label: s.nameEnglish,
                    sublabel: s.nameArabic,
                });
            }
        }

        return results;
    },
};
