#!/usr/bin/env node

/**
 * Schreibt einen Markdown-Report mit zwei Durchlaeufen ueber denselben
 * Datenstand:
 *
 *   1. Gesamtbestand – ohne jeden Ausschluss
 *   2. Bereinigt     – mit der aktiven Ausschlussliste
 *
 * plus einer Gegenueberstellung beider Zahlen. Beide Durchlaeufe laufen auf
 * einem einzigen Lesevorgang der Datendateien.
 *
 * Aufruf:  node helper/stats/report.js [optionen]
 *          npm run stats:report
 */

const fs = require('fs');
const path = require('path');
const v8 = require('v8');
const { execFileSync } = require('child_process');

const REQUIRED_HEAP_BYTES = 6 * 1024 * 1024 * 1024;

const ensureHeap = function ensureHeap() {
  if (process.env.CDA_STATS_CHILD === '1') return;
  if (v8.getHeapStatistics().heap_size_limit >= REQUIRED_HEAP_BYTES) return;

  try {
    execFileSync(
      process.execPath,
      ['--max-old-space-size=8192', __filename, ...process.argv.slice(2)],
      { stdio: 'inherit', env: { ...process.env, CDA_STATS_CHILD: '1' } },
    );
    process.exit(0);
  } catch (error) {
    process.exit(typeof error.status === 'number' ? error.status : 1);
  }
};

ensureHeap();

/* eslint-disable global-require */
const { collectScenarios, ROOT } = require('./lib/collect');
const { loadExclusions } = require('./lib/exclusions');
const markdown = require('./lib/markdown');
/* eslint-enable global-require */

const DEFAULTS = {
  dataDir: path.join(ROOT, 'cranach-data'),
  lang: 'de',
  exclusionsFile: path.join(__dirname, 'excluded-ids.json'),
  only: [],
  includeUnpublished: false,
  includeVirtualGraphics: false,
  followReprints: true,
  byType: true,
  out: path.join(__dirname, 'reports', 'abbildungen.md'),
};

const USAGE = `
Schreibt einen Markdown-Report: Gesamtbestand und bereinigter Bestand im Vergleich.

  node helper/stats/report.js [optionen]

Optionen
  --out=<datei>          Zieldatei (Default: helper/stats/reports/abbildungen.md)
  --data=<pfad>          Datenordner (Default: cranach-data)
  --lang=<de|en>         Sprachvariante der Exporte (Default: de)
  --exclusions=<datei>   Ausschlussliste (Default: helper/stats/excluded-ids.json)
  --exclude=<a,b>        Nur diese Gruppen der Ausschlussliste anwenden
  --include-unpublished  Unveroeffentlichte Werke mitzaehlen
  --include-virtual      Virtuelle Grafiken zu den Grafiken hinzunehmen
  --no-follow-reprints   Ausschluss NICHT auf die realen Abzuege ausweiten
  --no-by-type           Aufschluesselung nach Bildtyp weglassen
  --stdout               Report auf die Konsole statt in eine Datei
  --help                 Diese Hilfe
`;

const parseArgs = function parseArgs(argv) {
  const options = { ...DEFAULTS };

  argv.forEach((arg) => {
    const [flag, value] = arg.split(/=(.*)/s);

    switch (flag) {
      case '--out': options.out = path.resolve(value); break;
      case '--data': options.dataDir = path.resolve(value); break;
      case '--lang': options.lang = value; break;
      case '--exclusions': options.exclusionsFile = path.resolve(value); break;
      case '--exclude': options.only = value.split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--include-unpublished': options.includeUnpublished = true; break;
      case '--include-virtual': options.includeVirtualGraphics = true; break;
      case '--no-follow-reprints': options.followReprints = false; break;
      case '--no-by-type': options.byType = false; break;
      case '--stdout': options.stdout = true; break;
      case '--help':
      case '-h': options.help = true; break;
      default:
        throw new Error(`Unbekannte Option: ${arg}`);
    }
  });

  return options;
};

const activeLabel = (exclusions) => {
  const active = exclusions.groups.filter((group) => group.active);
  return active.length ? active.map((group) => group.label).join(', ') : 'keine';
};

const buildDocument = function buildDocument(options) {
  const exclusions = loadExclusions(options.exclusionsFile, {
    only: options.only,
    disabled: false,
  });
  const noExclusions = loadExclusions(options.exclusionsFile, { only: [], disabled: true });

  const { meta, scenarios } = collectScenarios(options, [
    { key: 'all', label: 'Gesamtbestand', exclusions: noExclusions },
    { key: 'filtered', label: 'Bereinigter Bestand', exclusions },
  ]);

  const [all, filtered] = scenarios;
  const createdAt = new Date().toISOString().slice(0, 10);
  const label = activeLabel(exclusions);

  const parts = [
    '# Digitalisierte Abbildungen im Cranach-Archiv',
    '',
    markdown.renderMeta(meta, createdAt),
    '',
    'Der Report zeigt zwei Durchläufe über denselben Datenstand: einmal den',
    `vollständigen Bestand, einmal bereinigt um die Ausschlussliste (${label}).`,
    '',
    '## 1. Gesamtbestand',
    '',
    'Alle Werke, ohne jeden Ausschluss.',
    '',
    markdown.renderOverview(all),
    '',
    markdown.renderNotes(all),
  ];

  if (options.byType) {
    parts.push('', '#### Aufschlüsselung nach Bildtyp', '', markdown.renderByType(all));
  }

  parts.push(
    '',
    `## 2. Bereinigter Bestand (ohne ${label})`,
    '',
    'Werke der Ausschlussliste sind mitsamt allen ihren Abbildungen ausgenommen.',
    '',
    markdown.renderOverview(filtered),
    '',
    markdown.renderNotes(filtered),
    '',
    '### Ausschluss',
    '',
    markdown.renderExclusions(filtered),
  );

  if (options.byType) {
    parts.push('', '#### Aufschlüsselung nach Bildtyp', '', markdown.renderByType(filtered));
  }

  parts.push(
    '',
    '## 3. Gegenüberstellung',
    '',
    markdown.renderComparison(all, filtered),
    '',
    `Der Ausschluss entfernt **${markdown.num(filtered.total.worksExcluded)} Werke** `
      + `mit **${markdown.num(all.total.images - filtered.total.images)} Abbildungen**, `
      + `davon **${markdown.num(all.total.downloadable - filtered.total.downloadable)} downloadbare**.`,
    '',
    '---',
    '',
    'Erzeugt mit `npm run stats:report` – siehe `helper/stats/README.md`.',
    '',
  );

  return parts.join('\n');
};

const main = function main() {
  let options;

  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error(USAGE);
    process.exit(1);
  }

  if (options.help) {
    console.log(USAGE);
    return;
  }

  try {
    const document = buildDocument(options);

    if (options.stdout) {
      console.log(document);
      return;
    }

    fs.mkdirSync(path.dirname(options.out), { recursive: true });
    fs.writeFileSync(options.out, document);
    console.log(`Report geschrieben: ${path.relative(ROOT, options.out) || options.out}`);
  } catch (error) {
    console.error(`Fehler: ${error.message}`);
    process.exit(1);
  }
};

main();
