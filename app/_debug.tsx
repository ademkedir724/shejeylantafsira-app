/**
 * DEBUG ONLY — delete this file when done.
 * Visit via: shake device → type /_debug in URL, or add a link temporarily.
 */
import { Text, View } from 'react-native';

export default function DebugScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'green' }}>✅ Root renders OK</Text>
            <Text style={{ fontSize: 14, color: '#333', marginTop: 8 }}>_debug screen is visible</Text>
        </View>
    );
}
