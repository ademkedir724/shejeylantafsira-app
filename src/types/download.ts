export type DownloadStatus = 'queued' | 'downloading' | 'paused' | 'completed' | 'error';

export interface DownloadItem {
    pageNumber: number;
    status: DownloadStatus;
    progress: number;             // 0–1
    error: string | null;
    resumable?: object;           // expo-file-system DownloadResumable handle
}

export interface DownloadState {
    downloadedPages: Set<number>;
    queue: DownloadItem[];
    activeCount: number;          // max 3
    wifiOnly: boolean;
}
