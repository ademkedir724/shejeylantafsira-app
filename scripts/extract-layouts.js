/**
 * Build script: extracts line-by-line text from all 604 layout .docx files
 * and writes src/features/quran/data/mushafLayouts.json
 *
 * Run once: node scripts/extract-layouts.js
 *
 * Output format:
 * {
 *   "1": ["ﱁ ﱂ ﱃ ﱄ ﱅ", "ﱆ ﱇ ﱈ ﱉ ﱊ", ...],
 *   "2": [...],
 *   ...
 * }
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LAYOUTS_DIR = path.resolve(__dirname, '../layout-for-pages');
const OUTPUT_FILE = path.resolve(__dirname, '../src/features/quran/data/mushafLayouts.json');

// Ensure output directory exists
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

const result = {};

for (let page = 1; page <= 604; page++) {
    const docxPath = path.join(LAYOUTS_DIR, `${page}.docx`);
    if (!fs.existsSync(docxPath)) {
        console.warn(`Missing: ${docxPath}`);
        result[page] = [];
        continue;
    }

    try {
        // Use Python to extract text from docx (no npm dependency needed)
        const lines = JSON.parse(
            execSync(
                `python3 -c "
import zipfile, re, json, sys
with zipfile.ZipFile('${docxPath}') as z:
    with z.open('word/document.xml') as f:
        content = f.read().decode('utf-8')
texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', content)
print(json.dumps(texts))
"`,
                { encoding: 'utf-8' }
            ).trim()
        );
        result[page] = lines;
        if (page % 50 === 0) console.log(`Processed page ${page}/604`);
    } catch (err) {
        console.error(`Error on page ${page}:`, err.message);
        result[page] = [];
    }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 0));
console.log(`Done. Written to ${OUTPUT_FILE}`);
console.log(`File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);
