import type { PageMetadata } from '@/types';

// ---------------------------------------------------------------------------
// Static surah reference data
// ---------------------------------------------------------------------------

interface SurahRef {
    number: number;
    nameArabic: string;
    nameEnglish: string;
    startPage: number;
    totalAyahs: number;
}

const SURAH_DATA: SurahRef[] = [
    { number: 1, nameArabic: 'الفاتحة', nameEnglish: 'Al-Fatiha', startPage: 1, totalAyahs: 7 },
    { number: 2, nameArabic: 'البقرة', nameEnglish: 'Al-Baqarah', startPage: 2, totalAyahs: 286 },
    { number: 3, nameArabic: 'آل عمران', nameEnglish: 'Al-Imran', startPage: 50, totalAyahs: 200 },
    { number: 4, nameArabic: 'النساء', nameEnglish: 'An-Nisa', startPage: 77, totalAyahs: 176 },
    { number: 5, nameArabic: 'المائدة', nameEnglish: 'Al-Maidah', startPage: 106, totalAyahs: 120 },
    { number: 6, nameArabic: 'الأنعام', nameEnglish: 'Al-Anam', startPage: 128, totalAyahs: 165 },
    { number: 7, nameArabic: 'الأعراف', nameEnglish: 'Al-Araf', startPage: 151, totalAyahs: 206 },
    { number: 8, nameArabic: 'الأنفال', nameEnglish: 'Al-Anfal', startPage: 177, totalAyahs: 75 },
    { number: 9, nameArabic: 'التوبة', nameEnglish: 'At-Tawbah', startPage: 187, totalAyahs: 129 },
    { number: 10, nameArabic: 'يونس', nameEnglish: 'Yunus', startPage: 208, totalAyahs: 109 },
    { number: 11, nameArabic: 'هود', nameEnglish: 'Hud', startPage: 221, totalAyahs: 123 },
    { number: 12, nameArabic: 'يوسف', nameEnglish: 'Yusuf', startPage: 235, totalAyahs: 111 },
    { number: 13, nameArabic: 'الرعد', nameEnglish: 'Ar-Rad', startPage: 249, totalAyahs: 43 },
    { number: 14, nameArabic: 'إبراهيم', nameEnglish: 'Ibrahim', startPage: 255, totalAyahs: 52 },
    { number: 15, nameArabic: 'الحجر', nameEnglish: 'Al-Hijr', startPage: 262, totalAyahs: 99 },
    { number: 16, nameArabic: 'النحل', nameEnglish: 'An-Nahl', startPage: 267, totalAyahs: 128 },
    { number: 17, nameArabic: 'الإسراء', nameEnglish: 'Al-Isra', startPage: 282, totalAyahs: 111 },
    { number: 18, nameArabic: 'الكهف', nameEnglish: 'Al-Kahf', startPage: 293, totalAyahs: 110 },
    { number: 19, nameArabic: 'مريم', nameEnglish: 'Maryam', startPage: 305, totalAyahs: 98 },
    { number: 20, nameArabic: 'طه', nameEnglish: 'Ta-Ha', startPage: 312, totalAyahs: 135 },
    { number: 21, nameArabic: 'الأنبياء', nameEnglish: 'Al-Anbiya', startPage: 322, totalAyahs: 112 },
    { number: 22, nameArabic: 'الحج', nameEnglish: 'Al-Hajj', startPage: 332, totalAyahs: 78 },
    { number: 23, nameArabic: 'المؤمنون', nameEnglish: 'Al-Muminun', startPage: 342, totalAyahs: 118 },
    { number: 24, nameArabic: 'النور', nameEnglish: 'An-Nur', startPage: 350, totalAyahs: 64 },
    { number: 25, nameArabic: 'الفرقان', nameEnglish: 'Al-Furqan', startPage: 359, totalAyahs: 77 },
    { number: 26, nameArabic: 'الشعراء', nameEnglish: 'Ash-Shuara', startPage: 367, totalAyahs: 227 },
    { number: 27, nameArabic: 'النمل', nameEnglish: 'An-Naml', startPage: 377, totalAyahs: 93 },
    { number: 28, nameArabic: 'القصص', nameEnglish: 'Al-Qasas', startPage: 385, totalAyahs: 88 },
    { number: 29, nameArabic: 'العنكبوت', nameEnglish: 'Al-Ankabut', startPage: 396, totalAyahs: 69 },
    { number: 30, nameArabic: 'الروم', nameEnglish: 'Ar-Rum', startPage: 404, totalAyahs: 60 },
    { number: 31, nameArabic: 'لقمان', nameEnglish: 'Luqman', startPage: 411, totalAyahs: 34 },
    { number: 32, nameArabic: 'السجدة', nameEnglish: 'As-Sajdah', startPage: 415, totalAyahs: 30 },
    { number: 33, nameArabic: 'الأحزاب', nameEnglish: 'Al-Ahzab', startPage: 418, totalAyahs: 73 },
    { number: 34, nameArabic: 'سبأ', nameEnglish: 'Saba', startPage: 428, totalAyahs: 54 },
    { number: 35, nameArabic: 'فاطر', nameEnglish: 'Fatir', startPage: 434, totalAyahs: 45 },
    { number: 36, nameArabic: 'يس', nameEnglish: 'Ya-Sin', startPage: 440, totalAyahs: 83 },
    { number: 37, nameArabic: 'الصافات', nameEnglish: 'As-Saffat', startPage: 446, totalAyahs: 182 },
    { number: 38, nameArabic: 'ص', nameEnglish: 'Sad', startPage: 453, totalAyahs: 88 },
    { number: 39, nameArabic: 'الزمر', nameEnglish: 'Az-Zumar', startPage: 458, totalAyahs: 75 },
    { number: 40, nameArabic: 'غافر', nameEnglish: 'Ghafir', startPage: 467, totalAyahs: 85 },
    { number: 41, nameArabic: 'فصلت', nameEnglish: 'Fussilat', startPage: 477, totalAyahs: 54 },
    { number: 42, nameArabic: 'الشورى', nameEnglish: 'Ash-Shura', startPage: 483, totalAyahs: 53 },
    { number: 43, nameArabic: 'الزخرف', nameEnglish: 'Az-Zukhruf', startPage: 489, totalAyahs: 89 },
    { number: 44, nameArabic: 'الدخان', nameEnglish: 'Ad-Dukhan', startPage: 496, totalAyahs: 59 },
    { number: 45, nameArabic: 'الجاثية', nameEnglish: 'Al-Jathiyah', startPage: 499, totalAyahs: 37 },
    { number: 46, nameArabic: 'الأحقاف', nameEnglish: 'Al-Ahqaf', startPage: 502, totalAyahs: 35 },
    { number: 47, nameArabic: 'محمد', nameEnglish: 'Muhammad', startPage: 507, totalAyahs: 38 },
    { number: 48, nameArabic: 'الفتح', nameEnglish: 'Al-Fath', startPage: 511, totalAyahs: 29 },
    { number: 49, nameArabic: 'الحجرات', nameEnglish: 'Al-Hujurat', startPage: 515, totalAyahs: 18 },
    { number: 50, nameArabic: 'ق', nameEnglish: 'Qaf', startPage: 518, totalAyahs: 45 },
    { number: 51, nameArabic: 'الذاريات', nameEnglish: 'Adh-Dhariyat', startPage: 520, totalAyahs: 60 },
    { number: 52, nameArabic: 'الطور', nameEnglish: 'At-Tur', startPage: 523, totalAyahs: 49 },
    { number: 53, nameArabic: 'النجم', nameEnglish: 'An-Najm', startPage: 526, totalAyahs: 62 },
    { number: 54, nameArabic: 'القمر', nameEnglish: 'Al-Qamar', startPage: 528, totalAyahs: 55 },
    { number: 55, nameArabic: 'الرحمن', nameEnglish: 'Ar-Rahman', startPage: 531, totalAyahs: 78 },
    { number: 56, nameArabic: 'الواقعة', nameEnglish: 'Al-Waqiah', startPage: 534, totalAyahs: 96 },
    { number: 57, nameArabic: 'الحديد', nameEnglish: 'Al-Hadid', startPage: 537, totalAyahs: 29 },
    { number: 58, nameArabic: 'المجادلة', nameEnglish: 'Al-Mujadila', startPage: 542, totalAyahs: 22 },
    { number: 59, nameArabic: 'الحشر', nameEnglish: 'Al-Hashr', startPage: 545, totalAyahs: 24 },
    { number: 60, nameArabic: 'الممتحنة', nameEnglish: 'Al-Mumtahanah', startPage: 549, totalAyahs: 13 },
    { number: 61, nameArabic: 'الصف', nameEnglish: 'As-Saf', startPage: 551, totalAyahs: 14 },
    { number: 62, nameArabic: 'الجمعة', nameEnglish: 'Al-Jumuah', startPage: 553, totalAyahs: 11 },
    { number: 63, nameArabic: 'المنافقون', nameEnglish: 'Al-Munafiqun', startPage: 554, totalAyahs: 11 },
    { number: 64, nameArabic: 'التغابن', nameEnglish: 'At-Taghabun', startPage: 556, totalAyahs: 18 },
    { number: 65, nameArabic: 'الطلاق', nameEnglish: 'At-Talaq', startPage: 558, totalAyahs: 12 },
    { number: 66, nameArabic: 'التحريم', nameEnglish: 'At-Tahrim', startPage: 560, totalAyahs: 12 },
    { number: 67, nameArabic: 'الملك', nameEnglish: 'Al-Mulk', startPage: 562, totalAyahs: 30 },
    { number: 68, nameArabic: 'القلم', nameEnglish: 'Al-Qalam', startPage: 564, totalAyahs: 52 },
    { number: 69, nameArabic: 'الحاقة', nameEnglish: 'Al-Haqqah', startPage: 566, totalAyahs: 52 },
    { number: 70, nameArabic: 'المعارج', nameEnglish: 'Al-Maarij', startPage: 568, totalAyahs: 44 },
    { number: 71, nameArabic: 'نوح', nameEnglish: 'Nuh', startPage: 570, totalAyahs: 28 },
    { number: 72, nameArabic: 'الجن', nameEnglish: 'Al-Jinn', startPage: 572, totalAyahs: 28 },
    { number: 73, nameArabic: 'المزمل', nameEnglish: 'Al-Muzzammil', startPage: 574, totalAyahs: 20 },
    { number: 74, nameArabic: 'المدثر', nameEnglish: 'Al-Muddaththir', startPage: 575, totalAyahs: 56 },
    { number: 75, nameArabic: 'القيامة', nameEnglish: 'Al-Qiyamah', startPage: 577, totalAyahs: 40 },
    { number: 76, nameArabic: 'الإنسان', nameEnglish: 'Al-Insan', startPage: 578, totalAyahs: 31 },
    { number: 77, nameArabic: 'المرسلات', nameEnglish: 'Al-Mursalat', startPage: 580, totalAyahs: 50 },
    { number: 78, nameArabic: 'النبأ', nameEnglish: 'An-Naba', startPage: 582, totalAyahs: 40 },
    { number: 79, nameArabic: 'النازعات', nameEnglish: 'An-Naziat', startPage: 583, totalAyahs: 46 },
    { number: 80, nameArabic: 'عبس', nameEnglish: 'Abasa', startPage: 585, totalAyahs: 42 },
    { number: 81, nameArabic: 'التكوير', nameEnglish: 'At-Takwir', startPage: 586, totalAyahs: 29 },
    { number: 82, nameArabic: 'الانفطار', nameEnglish: 'Al-Infitar', startPage: 587, totalAyahs: 19 },
    { number: 83, nameArabic: 'المطففين', nameEnglish: 'Al-Mutaffifin', startPage: 587, totalAyahs: 36 },
    { number: 84, nameArabic: 'الانشقاق', nameEnglish: 'Al-Inshiqaq', startPage: 589, totalAyahs: 25 },
    { number: 85, nameArabic: 'البروج', nameEnglish: 'Al-Buruj', startPage: 590, totalAyahs: 22 },
    { number: 86, nameArabic: 'الطارق', nameEnglish: 'At-Tariq', startPage: 591, totalAyahs: 17 },
    { number: 87, nameArabic: 'الأعلى', nameEnglish: 'Al-Ala', startPage: 591, totalAyahs: 19 },
    { number: 88, nameArabic: 'الغاشية', nameEnglish: 'Al-Ghashiyah', startPage: 592, totalAyahs: 26 },
    { number: 89, nameArabic: 'الفجر', nameEnglish: 'Al-Fajr', startPage: 593, totalAyahs: 30 },
    { number: 90, nameArabic: 'البلد', nameEnglish: 'Al-Balad', startPage: 594, totalAyahs: 20 },
    { number: 91, nameArabic: 'الشمس', nameEnglish: 'Ash-Shams', startPage: 595, totalAyahs: 15 },
    { number: 92, nameArabic: 'الليل', nameEnglish: 'Al-Layl', startPage: 595, totalAyahs: 21 },
    { number: 93, nameArabic: 'الضحى', nameEnglish: 'Ad-Duha', startPage: 596, totalAyahs: 11 },
    { number: 94, nameArabic: 'الشرح', nameEnglish: 'Ash-Sharh', startPage: 596, totalAyahs: 8 },
    { number: 95, nameArabic: 'التين', nameEnglish: 'At-Tin', startPage: 597, totalAyahs: 8 },
    { number: 96, nameArabic: 'العلق', nameEnglish: 'Al-Alaq', startPage: 597, totalAyahs: 19 },
    { number: 97, nameArabic: 'القدر', nameEnglish: 'Al-Qadr', startPage: 598, totalAyahs: 5 },
    { number: 98, nameArabic: 'البينة', nameEnglish: 'Al-Bayyinah', startPage: 598, totalAyahs: 8 },
    { number: 99, nameArabic: 'الزلزلة', nameEnglish: 'Az-Zalzalah', startPage: 599, totalAyahs: 8 },
    { number: 100, nameArabic: 'العاديات', nameEnglish: 'Al-Adiyat', startPage: 599, totalAyahs: 11 },
    { number: 101, nameArabic: 'القارعة', nameEnglish: 'Al-Qariah', startPage: 600, totalAyahs: 11 },
    { number: 102, nameArabic: 'التكاثر', nameEnglish: 'At-Takathur', startPage: 600, totalAyahs: 8 },
    { number: 103, nameArabic: 'العصر', nameEnglish: 'Al-Asr', startPage: 601, totalAyahs: 3 },
    { number: 104, nameArabic: 'الهمزة', nameEnglish: 'Al-Humazah', startPage: 601, totalAyahs: 9 },
    { number: 105, nameArabic: 'الفيل', nameEnglish: 'Al-Fil', startPage: 601, totalAyahs: 5 },
    { number: 106, nameArabic: 'قريش', nameEnglish: 'Quraysh', startPage: 602, totalAyahs: 4 },
    { number: 107, nameArabic: 'الماعون', nameEnglish: 'Al-Maun', startPage: 602, totalAyahs: 7 },
    { number: 108, nameArabic: 'الكوثر', nameEnglish: 'Al-Kawthar', startPage: 602, totalAyahs: 3 },
    { number: 109, nameArabic: 'الكافرون', nameEnglish: 'Al-Kafirun', startPage: 603, totalAyahs: 6 },
    { number: 110, nameArabic: 'النصر', nameEnglish: 'An-Nasr', startPage: 603, totalAyahs: 3 },
    { number: 111, nameArabic: 'المسد', nameEnglish: 'Al-Masad', startPage: 603, totalAyahs: 5 },
    { number: 112, nameArabic: 'الإخلاص', nameEnglish: 'Al-Ikhlas', startPage: 604, totalAyahs: 4 },
    { number: 113, nameArabic: 'الفلق', nameEnglish: 'Al-Falaq', startPage: 604, totalAyahs: 5 },
    { number: 114, nameArabic: 'الناس', nameEnglish: 'An-Nas', startPage: 604, totalAyahs: 6 },
];

// ---------------------------------------------------------------------------
// Juz boundary pages (standard Medina Mushaf)
// ---------------------------------------------------------------------------

const JUZ_START_PAGES: number[] = [
    1, 22, 42, 62, 82, 102, 122, 142, 162, 182,
    202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
    402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

// ---------------------------------------------------------------------------
// Build a lookup: page → surah (the surah active on that page)
// For pages where a new surah starts, that surah takes precedence.
// ---------------------------------------------------------------------------

function buildPageSurahMap(): Map<number, SurahRef> {
    const map = new Map<number, SurahRef>();

    // Walk pages 1–604 and assign the current surah
    let currentSurahIdx = 0;
    for (let page = 1; page <= 604; page++) {
        // Advance surah index if the next surah starts on this page
        while (
            currentSurahIdx + 1 < SURAH_DATA.length &&
            SURAH_DATA[currentSurahIdx + 1].startPage <= page
        ) {
            currentSurahIdx++;
        }
        map.set(page, SURAH_DATA[currentSurahIdx]);
    }
    return map;
}

// ---------------------------------------------------------------------------
// Compute approximate ayah range for a page within its surah
// ---------------------------------------------------------------------------

function computeAyahRange(
    page: number,
    surah: SurahRef,
): { startAyah: number; endAyah: number } {
    const nextSurah = SURAH_DATA.find(s => s.number === surah.number + 1);
    const surahEndPage = nextSurah ? nextSurah.startPage - 1 : 604;
    const surahPageCount = surahEndPage - surah.startPage + 1;

    if (surahPageCount <= 0) {
        return { startAyah: 1, endAyah: surah.totalAyahs };
    }

    // Distribute ayahs evenly across pages
    const ayahsPerPage = surah.totalAyahs / surahPageCount;
    const pageOffset = page - surah.startPage; // 0-based offset within surah

    const startAyah = Math.max(1, Math.round(pageOffset * ayahsPerPage) + 1);
    const endAyah = Math.min(
        surah.totalAyahs,
        Math.round((pageOffset + 1) * ayahsPerPage),
    );

    return {
        startAyah,
        endAyah: Math.max(startAyah, endAyah),
    };
}

// ---------------------------------------------------------------------------
// Generate all 604 PageMetadata entries
// ---------------------------------------------------------------------------

function buildPagesData(): PageMetadata[] {
    const pageSurahMap = buildPageSurahMap();
    const pages: PageMetadata[] = [];

    for (let pageNumber = 1; pageNumber <= 604; pageNumber++) {
        const surah = pageSurahMap.get(pageNumber)!;

        // Determine juz number
        let juzNumber = 1;
        for (let j = JUZ_START_PAGES.length - 1; j >= 0; j--) {
            if (pageNumber >= JUZ_START_PAGES[j]) {
                juzNumber = j + 1;
                break;
            }
        }

        const isFirstPageOfSurah = surah.startPage === pageNumber;
        // Basmala appears on first page of every surah except At-Tawbah (9)
        const hasBasmala = isFirstPageOfSurah && surah.number !== 9;

        const { startAyah, endAyah } = computeAyahRange(pageNumber, surah);

        pages.push({
            pageNumber,
            juzNumber,
            surahNumber: surah.number,
            surahNameArabic: surah.nameArabic,
            surahNameEnglish: surah.nameEnglish,
            startAyah,
            endAyah,
            isFirstPageOfSurah,
            hasBasmala,
        });
    }

    return pages;
}

export const PAGES_DATA: PageMetadata[] = buildPagesData();
export { SURAH_DATA };
