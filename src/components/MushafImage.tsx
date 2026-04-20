import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

// TODO: Dynamic image loading requires a native module or bundled assets
// Since require() must be static, only pre-bundled pages can be loaded.
// Currently no page images are bundled in assets/pages/, so onFallback()
// is called immediately for all pages. When images are added, build a
// static map here (e.g. { 1: require('../../../assets/pages/1.png'), ... }).

const BUNDLED_PAGE_IMAGES: Record<number, number> = {
    // Example (uncomment when images are added to assets/pages/):
    // 1: require('../../../assets/pages/1.png'),
    // 2: require('../../../assets/pages/2.png'),
    // 3: require('../../../assets/pages/3.png'),
};

export interface MushafImageProps {
    pageNumber: number;
    onFallback: () => void;
}

export function MushafImage({ pageNumber, onFallback }: MushafImageProps) {
    const source = BUNDLED_PAGE_IMAGES[pageNumber];

    useEffect(() => {
        if (!source) {
            onFallback();
        }
    }, [pageNumber, source, onFallback]);

    if (!source) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Image
                source={source}
                resizeMode="contain"
                style={styles.image}
                onError={onFallback}
                accessibilityLabel={`Mushaf page ${pageNumber}`}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image: {
        flex: 1,
        width: '100%',
    },
});
