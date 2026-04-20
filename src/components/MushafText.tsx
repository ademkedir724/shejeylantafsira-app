/**
 * MushafText.tsx
 *
 * Wrapper that delegates to MushafPage for proper Dar al-Maarifah rendering.
 * MushafPage uses the per-page QPC font + extracted layout lines from the
 * .docx files to reproduce the printed Mushaf exactly.
 */

import React from 'react';
import type { ReadingTheme } from '../types/preferences';
import { MushafPage } from './MushafPage';

export interface MushafTextProps {
    pageNumber: number;
    fontSize: number;
    theme: ReadingTheme;
    /** Optional: called when a word is tapped (future Tajweed / audio sync) */
    onWordTap?: (lineIndex: number, wordIndex: number, text: string) => void;
}

export function MushafText({ pageNumber, fontSize, theme, onWordTap }: MushafTextProps) {
    return (
        <MushafPage
            pageNumber={pageNumber}
            fontSize={fontSize}
            theme={theme}
            onWordTap={onWordTap}
        />
    );
}
