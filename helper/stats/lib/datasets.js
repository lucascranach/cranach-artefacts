/**
 * Rubriken des Archivs und die zugehoerigen Datendateien.
 *
 * Eine Rubrik kann aus mehreren Dateien bestehen (siehe Grafiken). Dateien, die
 * mit `optional: true` markiert sind, werden nur beruecksichtigt, wenn sie ueber
 * einen CLI-Schalter explizit hinzugenommen werden.
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  {
    key: 'paintings',
    label: 'Gemälde',
    sources: [
      { key: 'paintings', label: 'Gemälde', file: 'cda-paintings-v2.{lang}.json' },
    ],
  },
  {
    key: 'drawings',
    label: 'Zeichnungen',
    sources: [
      { key: 'drawings', label: 'Zeichnungen', file: 'cda-drawings-v2.{lang}.json' },
    ],
  },
  {
    key: 'graphics',
    label: 'Grafiken',
    sources: [
      { key: 'graphics-real', label: 'Grafiken (real)', file: 'cda-graphics-v2.real.{lang}.json' },
      {
        key: 'graphics-virtual',
        label: 'Grafiken (virtuell)',
        file: 'cda-graphics-v2.virtual.{lang}.json',
        optional: true,
      },
    ],
  },
];

const resolveSourceFile = (dataDir, source, lang) => path
  .resolve(dataDir, source.file.replace('{lang}', lang));

const loadItems = function loadItems(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Datendatei nicht gefunden: ${file}`);
  }

  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));

  if (!parsed || !Array.isArray(parsed.items)) {
    throw new Error(`Unerwartete Struktur (kein items-Array): ${file}`);
  }

  return parsed.items;
};

module.exports = {
  CATEGORIES,
  resolveSourceFile,
  loadItems,
};
