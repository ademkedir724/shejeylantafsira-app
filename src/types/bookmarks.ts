export interface Bookmark {
    id: string;                   // uuid
    pageNumber: number;
    surahNameEnglish: string;
    juzNumber: number;
    label: string;                // max 60 chars, may be empty
    createdAt: number;            // Unix timestamp ms
}
