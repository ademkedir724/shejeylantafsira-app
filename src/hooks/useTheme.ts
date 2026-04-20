import type { ThemePalette } from '../constants/theme';
import { spacing, THEMES, typography } from '../constants/theme';
import { useStore } from '../store';

export interface UseThemeResult {
    palette: ThemePalette;
    fontSize: number;
    typography: typeof typography;
    spacing: typeof spacing;
}

export function useTheme(): UseThemeResult {
    const theme = useStore((s) => s.preferences.theme);
    const fontSize = useStore((s) => s.preferences.fontSize);

    return {
        palette: THEMES[theme],
        fontSize,
        typography,
        spacing,
    };
}
