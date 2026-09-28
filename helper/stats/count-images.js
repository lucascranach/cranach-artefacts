#!/usr/bin/env node

/**
 * Zaehlt die digitalisierten Abbildungen im Archiv, gruppiert nach Rubrik
 * (Gemaelde, Zeichnungen, Grafiken) und weist aus, wie viele davon downloadbar
 * sind. Werke, deren Cranach-ID in der Ausschlussliste steht, werden ignoriert.
 *
 * Aufruf:  node helper/stats/count-images.js [optionen]
 *          npm run stats:images
 *
 * Siehe helper/stats/README.md
 */

const path = require('path');
const v8 = require('v8');
const { execFileSync } = require('child_process');

const REQUIRED_HEAP_BYTES = 6 * 1024 * 1024 * 1024;

/**
 * Die Paintings-Datei ist ueber 100 MB gross. Reicht der Standard-Heap nicht,
 * startet sich das Skript einmalig mit groesserem Limit neu.
 */
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
const { collect, ROOT } = require('./lib/collect');
const { loadExclusions, listGroups } = require('./lib/exclusions');
const { printReport } = require('./lib/format');
/* eslint-enable global-require */

const DEFAULTS = {
  dataDir: path.join(ROOT, 'cranach-data'),
  lang: 'de',
  exclusionsFile: path.join(__dirname, 'excluded-ids.json'),
  only: [],
  noExclude: false,
  includeUnpublished: false,
  includeVirtualGraphics: false,
  followReprints: true,
  byType: true,
  json: false,
};

const USAGE = `
Zaehlt digitalisierte Abbildungen im Cranach-Archiv.

  node helper/stats/count-images.js [optionen]

Optionen
  --data=<pfad>          Datenordner (Default: cranach-data)
  --lang=<de|en>         Sprachvariante der Exporte (Default: de)
  --exclusions=<datei>   Ausschlussliste (Default: helper/stats/excluded-ids.json)
  --exclude=<a,b>        Nur diese Gruppen der Ausschlussliste anwenden
  --no-exclude           Ausschlussliste komplett ignorieren
  --include-unpublished  Unveroeffentlichte Werke mitzaehlen
  --include-virtual      Virtuelle Grafiken zu den Grafiken hinzunehmen
  --no-follow-reprints   Ausschluss NICHT auf die realen Abzuege virtueller
                         Grafiken ausweiten
  --no-by-type           Aufschluesselung nach Bildtyp weglassen
  --json                 Ergebnis als JSON ausgeben
  --list-groups          Gruppen der Ausschlussliste anzeigen und beenden
  --help                 Diese Hilfe
`;

const parseArgs = function parseArgs(argv) {
  const options = { ...DEFAULTS };

  argv.forEach((arg) => {
    const [flag, value] = arg.split(/=(.*)/s);

    switch (flag) {
      case '--data': options.dataDir = path.resolve(value); break;
      case '--lang': options.lang = value; break;
      case '--exclusions': options.exclusionsFile = path.resolve(value); break;
      case '--exclude': options.only = value.split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--no-exclude': options.noExclude = true; break;
      case '--include-unpublished': options.includeUnpublished = true; break;
      case '--include-virtual': options.includeVirtualGraphics = true; break;
      case '--no-follow-reprints': options.followReprints = false; break;
      case '--no-by-type': options.byType = false; break;
      case '--json': options.json = true; break;
      case '--list-groups': options.listGroups = true; break;
      case '--help':
      case '-h': options.help = true; break;
      default:
        throw new Error(`Unbekannte Option: ${arg}`);
    }
  });

  return options;
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
    if (options.listGroups) {
      listGroups(options.exclusionsFile).forEach((group) => {
        const state = group.active ? '[aktiv]  ' : '[inaktiv]';
        const comment = group.comment ? ` – ${group.comment}` : '';
        console.log(`${state} ${group.name} – ${group.label} (${group.count} IDs)${comment}`);
      });
      return;
    }

    const exclusions = loadExclusions(options.exclusionsFile, {
      only: options.only,
      disabled: options.noExclude,
    });
    const report = collect(options, exclusions);

    if (options.json) {
      console.log(JSON.stringify({
        ...report,
        exclusions: { ...report.exclusions, ids: [...report.exclusions.ids] },
      }, null, 2));
      return;
    }

    printReport(report);
  } catch (error) {
    console.error(`Fehler: ${error.message}`);
    process.exit(1);
  }
};

main();
