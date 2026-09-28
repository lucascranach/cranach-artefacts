/**
 * Konsolenausgabe der Auszaehlung.
 */

const TYPE_LABELS = {
  overall: 'Gesamtaufnahme',
  reverse: 'Rückseite',
  detail: 'Detail',
  irr: 'Infrarot-Reflektografie',
  x_radiograph: 'Röntgenaufnahme',
  uv_light: 'UV-Licht',
  transmitted_light: 'Durchlicht',
  photomicrograph: 'Mikroskopaufnahme',
  analysis: 'Analyse',
  conservation: 'Restaurierung',
  rkd: 'RKD',
  koe: 'KOE',
  other: 'Sonstige',
};

const num = (value) => value.toLocaleString('de-DE');

const percent = (part, total) => (total === 0 ? '–' : `${((part / total) * 100).toFixed(1).replace('.', ',')} %`);

const pad = (value, width) => String(value).padStart(width);
const padEnd = (value, width) => String(value).padEnd(width);

const printRow = (cells, widths) => {
  const line = cells
    .map((cell, index) => (index === 0 ? padEnd(cell, widths[index]) : pad(cell, widths[index])))
    .join('  ');
  console.log(line);
};

const WIDTHS = [26, 9, 12, 12, 9];

const printTableHeader = () => {
  printRow(['Rubrik', 'Werke', 'Abbildungen', 'downloadbar', 'Anteil'], WIDTHS);
  console.log('-'.repeat(WIDTHS.reduce((sum, w) => sum + w + 2, -2)));
};

const printStatsRow = (stats, indent = '') => {
  printRow([
    `${indent}${stats.label}`,
    num(stats.works),
    num(stats.images),
    num(stats.downloadable),
    percent(stats.downloadable, stats.images),
  ], WIDTHS);
};

const printByType = (stats) => {
  const rows = Object.entries(stats.byType)
    .sort((a, b) => b[1].images - a[1].images);

  if (!rows.length) return;

  console.log('');
  console.log(`  Aufschlüsselung nach Bildtyp – ${stats.label}`);
  rows.forEach(([type, bucket]) => {
    printRow([
      `    ${TYPE_LABELS[type] || type}`,
      num(bucket.works),
      num(bucket.images),
      num(bucket.downloadable),
      percent(bucket.downloadable, bucket.images),
    ], WIDTHS);
  });
};

const printReport = function printReport(report) {
  const {
    categories, total, exclusions, meta,
  } = report;

  console.log('');
  console.log('Digitalisierte Abbildungen im Cranach-Archiv');
  console.log(`Datenquelle: ${meta.dataDir} (Sprache: ${meta.lang}, Stand: ${meta.dataDate})`);
  console.log(`Werke: ${meta.includeUnpublished ? 'inkl.' : 'ohne'} unveröffentlichte · Overview-Derivate herausgerechnet`);
  if (!meta.followReprints) {
    console.log('Ausschluss wirkt NICHT auf die realen Abzüge virtueller Grafiken (--no-follow-reprints)');
  }
  console.log('');

  printTableHeader();
  categories.forEach((category) => {
    printStatsRow(category.total);
    if (category.sources.length > 1) {
      category.sources.forEach((source) => printStatsRow(source, '  └ '));
    }
  });
  console.log('-'.repeat(WIDTHS.reduce((sum, w) => sum + w + 2, -2)));
  printStatsRow(total);

  if (meta.byType) {
    categories.forEach((category) => printByType(category.total));
  }

  console.log('');
  console.log('Hinweise');
  console.log(`  Werke mit mindestens einer Abbildung: ${num(total.worksWithImages)} von ${num(total.works)}`);
  console.log(`  Werke mit mindestens einer downloadbaren Abbildung: ${num(total.worksWithDownloadableImages)}`);
  if (!meta.includeUnpublished) {
    console.log(`  Übersprungen, weil unveröffentlicht: ${num(total.worksUnpublished)} Werke`);
  }
  console.log(`  Herausgerechnete Overview-Derivate: ${num(total.overviewSkipped)} Bilddateien`);
  if (total.duplicateIds > 0) {
    console.log(`  Achtung: ${num(total.duplicateIds)} doppelte Cranach-IDs im Datenbestand`);
  }

  console.log('');
  console.log('Ausschluss');
  if (!exclusions.groups.length) {
    console.log('  keine Ausschlussliste aktiv');
  } else {
    exclusions.groups.forEach((group) => {
      const state = group.active ? 'aktiv' : 'inaktiv';
      const comment = group.comment ? ` – ${group.comment}` : '';
      console.log(`  [${state}] ${group.label} (${group.name}): ${num(group.ids.length)} IDs${comment}`);
    });
    console.log(`  Ausgeschlossene Werke im Datenbestand: ${num(total.worksExcluded)}`);
    if (meta.followReprints) {
      console.log(`  davon reale Abzüge ausgeschlossener virtueller Grafiken: ${num(total.worksExcludedViaReprint)}`);
    }
    if (exclusions.unmatched.length) {
      console.log(`  Nicht im ausgewerteten Bestand (${exclusions.unmatched.length}): ${exclusions.unmatched.join(', ')}`);
      if (!meta.includeVirtualGraphics) {
        console.log('  Hinweis: virtuelle Grafiken werden nicht ausgewertet – ggf. mit --include-virtual gegenprüfen.');
      }
    }
  }
  console.log('');
};

module.exports = {
  printReport,
  TYPE_LABELS,
};
