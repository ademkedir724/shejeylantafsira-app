import * as FileSystem from 'expo-file-system/legacy';
import { buildLqUrl } from '../../constants/config';
import type { DownloadItem } from '../../types/download';

// ─── Path helper ────────────────────────────────────────────────────────────

/** Returns the local filesystem path for a downloaded page audio file. */
export function getLocalPath(pageNumber: number): string {
    return `${FileSystem.documentDirectory}audio/lq/${pageNumber}.mp3`;
}

// ─── Directory helper ────────────────────────────────────────────────────────

async function ensureAudioDir(): Promise<void> {
    const dir = `${FileSystem.documentDirectory}audio/lq/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
}

// ─── Store dispatch interface ────────────────────────────────────────────────

export interface DownloadDispatch {
    updateProgress: (pageNumber: number, progress: number) => void;
    markDownloaded: (pageNumber: number) => void;
    markMissing: (pageNumber: number) => void;
    setError?: (pageNumber: number, error: string) => void;
    // cancelDownload is used to remove errored items from queue
    cancelDownload: (pageNumber: number) => void;
}

// ─── startDownload ───────────────────────────────────────────────────────────

/**
 * Creates the audio directory if needed, then downloads the page audio file
 * using FileSystem.createDownloadResumable. Calls callbacks on progress,
 * completion, or error.
 */
export async function startDownload(
    pageNumber: number,
    remoteUrl: string,
    onProgress: (progress: number) => void,
    onComplete: () => void,
    onError: (error: string) => void,
): Promise<void> {
    try {
        await ensureAudioDir();

        const dest = getLocalPath(pageNumber);

        const resumable = FileSystem.createDownloadResumable(
            remoteUrl,
            dest,
            {},
            ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
                if (totalBytesExpectedToWrite > 0) {
                    onProgress(totalBytesWritten / totalBytesExpectedToWrite);
                }
            },
        );

        const result = await resumable.downloadAsync();

        if (result && result.status === 200) {
            onComplete();
        } else {
            onError(`Download failed with status ${result?.status ?? 'unknown'}`);
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Download error';
        onError(message);
    }
}

// ─── processQueue ────────────────────────────────────────────────────────────

/**
 * Picks up to MAX_CONCURRENT_DOWNLOADS queued items and starts them.
 * Respects pause state and wifi-only preference.
 */
export function processQueue(
    queue: DownloadItem[],
    downloadedPages: Set<number>,
    isQueuePaused: boolean,
    isWifi: boolean,
    wifiOnlyDownload: boolean,
    maxConcurrent: number,
    dispatch: DownloadDispatch,
): void {
    if (isQueuePaused) return;
    if (wifiOnlyDownload && !isWifi) return;

    const active = queue.filter((i) => i.status === 'downloading');
    const queued = queue.filter((i) => i.status === 'queued');
    const slots = maxConcurrent - active.length;

    if (slots <= 0) return;

    for (const item of queued.slice(0, slots)) {
        const { pageNumber } = item;
        const url = buildLqUrl(pageNumber);

        // Mark as downloading immediately via progress update
        dispatch.updateProgress(pageNumber, 0);

        startDownload(
            pageNumber,
            url,
            (progress) => dispatch.updateProgress(pageNumber, progress),
            () => dispatch.markDownloaded(pageNumber),
            (error) => {
                if (dispatch.setError) {
                    dispatch.setError(pageNumber, error);
                } else {
                    dispatch.cancelDownload(pageNumber);
                }
            },
        );
    }
}

// ─── checkIntegrity ──────────────────────────────────────────────────────────

/**
 * For each page in downloadedPages, checks that the local file exists.
 * Returns an array of page numbers whose files are missing.
 */
export async function checkIntegrity(downloadedPages: Set<number>): Promise<number[]> {
    const missing: number[] = [];

    await Promise.all(
        [...downloadedPages].map(async (pageNumber) => {
            const path = getLocalPath(pageNumber);
            const info = await FileSystem.getInfoAsync(path);
            if (!info.exists) {
                missing.push(pageNumber);
            }
        }),
    );

    return missing;
}
