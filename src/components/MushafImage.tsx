import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { PAGE_IMAGES } from '../features/quran/pageImages';

interface MushafImageProps {
    pageNumber: number;
}

export function MushafImage({ pageNumber }: MushafImageProps) {
    return (
        <View style={styles.container}>
            <Image
                source={PAGE_IMAGES[pageNumber]}
                contentFit="contain"
                style={styles.image}
                accessibilityLabel={`Mushaf page ${pageNumber}`}
                transition={100}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    image: { flex: 1, width: '100%' },
});
