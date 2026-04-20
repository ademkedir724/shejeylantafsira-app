import type { StateCreator } from 'zustand';
import { PAGES_DATA } from '../features/quran/data/pages';
import type { DownloadItem } from '../types/download';

export interface DownloadSlice {
    downloadedPages: Set<number>;
    queue: DownloadItem[];
    isQueuePaused: boolean;
    enqueueDownload: (pageNumber: number) => void;
    enqueueJuz: (juzNumber: number) => void;
    enqueueAll: () => void;
    cancelDownload: (pageNumber: number) => void;
    pauseQueue: () => void;
    resumeQueue: () => void;
    markDownloaded: (pageNumber: number) => void;
    markMissing: (pageNumber: number) => void;
    updateProgress: (pageNumber: number, progress: number) => void;
}

export const createDownloadSlice: StateCreator<
    DownloadSlice,
    [['zustand/immer', never]],
    [],
    DownloadSlice
> = (set) => ({
    downloadedPages: new Set<number>(),
    queue: [],
    isQueuePaused: false,

    enqueueDownload: (pageNumber) =>
        set((state) => {
            const alreadyDownloaded = state.downloadedPages.has(pageNumber);
            const alreadyQueued = state.queue.some((item) => item.pageNumber === pageNumber);
            if (alreadyDownloaded || alreadyQueued) return;

            state.queue.push({
                pageNumber,
                status: 'queued',
                progress: 0,
                error: null,
            });
        }),

    enqueueJuz: (juzNumber) =>
        set((state) => {
            const pages = PAGES_DATA.filter((p) => p.juzNumber === juzNumber);
            for (const page of pages) {
                const alreadyDownloaded = state.downloadedPages.has(page.pageNumber);
                const alreadyQueued = state.queue.some((item) => item.pageNumber === page.pageNumber);
                if (alreadyDownloaded || alreadyQueued) continue;

                state.queue.push({
                    pageNumber: page.pageNumber,
                    status: 'queued',
                    progress: 0,
                    error: null,
                });
            }
        }),

    enqueueAll: () =>
        set((state) => {
            for (let pageNumber = 1; pageNumber <= 604; pageNumber++) {
                const alreadyDownloaded = state.downloadedPages.has(pageNumber);
                const alreadyQueued = state.queue.some((item) => item.pageNumber === pageNumber);
                if (alreadyDownloaded || alreadyQueued) continue;

                state.queue.push({
                    pageNumber,
                    status: 'queued',
                    progress: 0,
                    error: null,
                });
            }
        }),

    cancelDownload: (pageNumber) =>
        set((state) => {
            state.queue = state.queue.filter((item) => item.pageNumber !== pageNumber);
        }),

    pauseQueue: () =>
        set((state) => {
            state.isQueuePaused = true;
            for (const item of state.queue) {
                if (item.status === 'queued' || item.status === 'downloading') {
                    item.status = 'paused';
                }
            }
        }),

    resumeQueue: () =>
        set((state) => {
            state.isQueuePaused = false;
            for (const item of state.queue) {
                if (item.status === 'paused') {
                    item.status = 'queued';
                }
            }
        }),

    markDownloaded: (pageNumber) =>
        set((state) => {
            state.downloadedPages.add(pageNumber);
            state.queue = state.queue.filter((item) => item.pageNumber !== pageNumber);
        }),

    markMissing: (pageNumber) =>
        set((state) => {
            state.downloadedPages.delete(pageNumber);
        }),

    updateProgress: (pageNumber, progress) =>
        set((state) => {
            const item = state.queue.find((i) => i.pageNumber === pageNumber);
            if (item) {
                item.progress = progress;
                if (item.status !== 'downloading') {
                    item.status = 'downloading';
                }
            }
        }),
});
