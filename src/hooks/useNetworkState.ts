import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';

import { useStore } from '../store/index';

export interface NetworkState {
    isConnected: boolean;
    isWifi: boolean;
}

/**
 * Wraps @react-native-community/netinfo to expose a simple
 * { isConnected, isWifi } object. Updates reactively on connectivity changes.
 *
 * Side effects:
 * - When connectivity is lost (isConnected → false), calls pauseQueue()
 * - When connectivity is restored (isConnected → true), calls resumeQueue()
 */
export function useNetworkState(): NetworkState {
    const [state, setState] = useState<NetworkState>({
        isConnected: true,
        isWifi: false,
    });

    const pauseQueue = useStore((s) => s.pauseQueue);
    const resumeQueue = useStore((s) => s.resumeQueue);

    // Track previous connected state to detect transitions
    const prevConnected = useRef<boolean | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((netState) => {
            const isConnected = netState.isConnected ?? false;
            const isWifi = netState.type === 'wifi';

            setState({ isConnected, isWifi });

            // Only act on transitions, not the initial value
            if (prevConnected.current !== null && prevConnected.current !== isConnected) {
                if (!isConnected) {
                    pauseQueue();
                } else {
                    resumeQueue();
                }
            }

            prevConnected.current = isConnected;
        });

        return unsubscribe;
    }, [pauseQueue, resumeQueue]);

    return state;
}
