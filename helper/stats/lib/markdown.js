/**
 * Rendert die Auszaehlung als Markdown-Dokument.
 */

const { TYPE_LABELS } = require('./format');

const num = (value) => value.toLocaleString('de-DE');

const percent = (part, total) => (total === 0 ? '–' : `${((part / total) * 100).toFixed(1).replace('.', ',')} %`);

const signed = (value) => (value > 0 ? `+${num(value)}` : num(value));

const row = (cells) => `| ${cells.join(' | ')} |`;

const table = (head, rows) => [
  row(head),
  row(head.map((cell, index) => (index === 0 ? '---' : '---:'))),
  ...rows.map(row),
].join('\n');

const statsCells = (label, stats) => [
  label,
  num(stats.works),
  num(stats.images),
  num(stats.downloadable),
  percent(stats.downloadable, stats.images),
];

const HEAD = ['Rubrik', 'Werke', 'Abbildungen', 'downloadbar', 'Anteil'];

const renderOverview = (scenario) => {
  const rows = [];

  scenario.categories.forEach((category) => {
    rows.push(statsCells(`**${category.total.label}**`, category.total));
    if (category.sources.length > 1) {
      category.sources.forEach((source) => rows.push(statsCells(`&nbsp;&nbsp;↳ ${source.label}`, source)));
    }
  });

  rows.push(statsCells('**Gesamt**', scenario.total));

  return table(HEAD, rows);
};

const renderByType = (scenario) => scenario.categories.map((category) => {
  const rows = Object.entries(category.total.byType)
    .sort((a, b) => b[1].images - a[1].images)
    .map(([type, bucket]) => [
      TYPE_LABELS[type] || type,
      num(bucket.works),
      num(bucket.images),
      num(bucket.downloadable),
      percent(bucket.downloadable, bucket.images),
    ]);

  if (!rows.length) return '';

  return [
    `##### ${category.total.label}`,
    '',
    table(['Bildtyp', 'Werke', 'Abbildungen', 'downloadbar', 'Anteil'], rows),
  ].join('\n');
}).filter(Boolean).join('\n\n');

const renderNotes = (scenario) => {
  const { total, meta } = scenario;
  const lines = [
    `- Werke mit mindestens einer Abbildung: ${num(total.worksWithImages)} von ${num(total.works)}`,
    `- Werke mit mindestens einer downloadbaren Abbildung: ${num(total.worksWithDownloadableImages)}`,
    `- Herausgerechnete Overview-Derivate: ${num(total.overviewSkipped)} Bilddateien`,
  ];

  if (!meta.includeUnpublished) {
    lines.push(`- Übersprungen, weil unveröffentlicht: ${num(total.worksUnpublished)} Werke`);
  }
  if (total.duplicateIds > 0) {
    lines.push(`- **Achtung:** ${num(total.duplicateIds)} doppelte Cranach-IDs im Datenbestand`);
  }

  return lines.join('\n');
};

const renderExclusions = (scenario) => {
  const { exclusions, total, meta } = scenario;

  if (!exclusions.groups.length) return '- keine Ausschlussliste aktiv';

  const lines = exclusions.groups.map((group) => {
    const state = group.active ? 'aktiv' : 'inaktiv';
    const comment = group.comment ? ` – ${group.comment}` : '';
    return `- \`${group.name}\` (${state}): **${group.label}**, ${num(group.ids.length)} IDs${comment}`;
  });

  lines.push(`- Ausgeschlossene Werke im Datenbestand: **${num(total.worksExcluded)}**`);

  if (meta.followReprints) {
    lines.push(`- davon reale Abzüge ausgeschlossener virtueller Grafiken: ${num(total.worksExcludedViaReprint)}`);
  }
  if (exclusions.unmatched.length) {
    lines.push(`- Nicht im ausgewerteten Bestand (${exclusions.unmatched.length}): ${exclusions.unmatched.map((id) => `\`${id}\``).join(', ')}`);
  }

  return lines.join('\n');
};

/** Gegenueberstellung zweier Szenarien inkl. Differenz. */
const renderComparison = (before, after) => {
  const rows = before.categories.map((category, index) => {
    const a = category.total;
    const b = after.categories[index].total;

    return [
      a.label,
      num(a.images),
      num(b.images),
      signed(b.images - a.images),
      num(a.downloadable),
      num(b.downloadable),
      signed(b.downloadable - a.downloadable),
    ];
  });

  rows.push([
    '**Gesamt**',
    num(before.total.images),
    num(after.total.images),
    signed(after.total.images - before.total.images),
    num(before.total.downloadable),
    num(after.total.downloadable),
    signed(after.total.downloadable - before.total.downloadable),
  ]);

  return table(
    ['Rubrik', 'Abb. gesamt', 'Abb. bereinigt', 'Δ', 'DL gesamt', 'DL bereinigt', 'Δ'],
    rows,
  );
};

const renderMeta = (meta, createdAt) => [
  `- Datenquelle: \`${meta.dataDir}\` (Sprache: ${meta.lang})`,
  `- Datenstand: ${meta.dataDate}`,
  `- Report erstellt: ${createdAt}`,
  `- Unveröffentlichte Werke: ${meta.includeUnpublished ? 'enthalten' : 'nicht enthalten'}`,
  `- Virtuelle Grafiken: ${meta.includeVirtualGraphics ? 'enthalten' : 'nicht enthalten'}`,
  `- Ausschluss wirkt auf reale Abzüge virtueller Grafiken: ${meta.followReprints ? 'ja' : 'nein'}`,
  '- Overview-Derivate sind herausgerechnet',
].join('\n');

module.exports = {
  renderOverview,
  renderByType,
  renderNotes,
  renderExclusions,
  renderComparison,
  renderMeta,
  num,
  signed,
};
