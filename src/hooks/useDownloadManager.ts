import { useEffect } from 'react';
import { MAX_CONCURRENT_DOWNLOADS } from '../constants/config';
import { checkIntegrity, processQueue } from '../features/download/downloadManager';
import useStore from '../store';
import { useNetworkState } from './useNetworkState';

/**
 * Side-effect-only hook that:
 * 1. On mount, runs an integrity check and calls markMissing for absent files.
 * 2. Reactively calls processQueue whenever the queue, pause state, or
 *    network state changes.
 */
export function useDownloadManager(): void {
    const queue = useStore((s) => s.queue);
    const downloadedPages = useStore((s) => s.downloadedPages);
    const isQueuePaused = useStore((s) => s.isQueuePaused);
    const wifiOnlyDownload = useStore((s) => s.preferences.wifiOnlyDownload);

    const updateProgress = useStore((s) => s.updateProgress);
    const markDownloaded = useStore((s) => s.markDownloaded);
    const markMissing = useStore((s) => s.markMissing);
    const cancelDownload = useStore((s) => s.cancelDownload);

    const { isConnected, isWifi } = useNetworkState();

    // Launch-time integrity check
    useEffect(() => {
        checkIntegrity(downloadedPages).then((missing) => {
            for (const pageNumber of missing) {
                markMissing(pageNumber);
            }
        });
        // Only run once on mount — downloadedPages snapshot at mount time is intentional
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Process queue reactively when queue or network state changes
    useEffect(() => {
        if (!isConnected) return;

        processQueue(
            queue,
            downloadedPages,
            isQueuePaused,
            isWifi,
            wifiOnlyDownload,
            MAX_CONCURRENT_DOWNLOADS,
            {
                updateProgress,
                markDownloaded,
                markMissing,
                cancelDownload,
            },
        );
    }, [
        queue,
        isQueuePaused,
        isConnected,
        isWifi,
        wifiOnlyDownload,
        downloadedPages,
        updateProgress,
        markDownloaded,
        markMissing,
        cancelDownload,
    ]);
}
