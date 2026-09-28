/**
 * Sammelt die Auszaehlung – wahlweise fuer mehrere Szenarien in einem Durchgang.
 *
 * Jede Quelldatei wird nur einmal gelesen und geparst; die Szenarien zaehlen
 * anschliessend auf demselben Datensatz. Das ist wichtig, weil allein
 * `cda-paintings-v2.de.json` ueber 100 MB gross ist.
 */

const fs = require('fs');
const path = require('path');

const { CATEGORIES, resolveSourceFile, loadItems } = require('./datasets');
const { countSource, mergeStats } = require('./count');

const ROOT = path.resolve(__dirname, '..', '..', '..');

/**
 * @param {Object} options CLI-Optionen (dataDir, lang, includeUnpublished, ...)
 * @param {Array} scenarios [{ key, label, exclusions }] – exclusions aus lib/exclusions
 */
const collectScenarios = function collectScenarios(options, scenarios) {
  const runs = scenarios.map((scenario) => ({
    ...scenario,
    matchedExcludedIds: new Set(),
    categories: [],
  }));

  const dataDates = [];

  CATEGORIES.forEach((category) => {
    const sources = category.sources
      .filter((source) => !source.optional || options.includeVirtualGraphics);

    const perRun = runs.map(() => []);

    sources.forEach((source) => {
      const file = resolveSourceFile(options.dataDir, source, options.lang);
      const items = loadItems(file);
      dataDates.push(fs.statSync(file).mtime);

      runs.forEach((run, index) => {
        perRun[index].push(countSource(items, {
          excludedIds: run.exclusions.ids,
          matchedExcludedIds: run.matchedExcludedIds,
          includeUnpublished: options.includeUnpublished,
          followReprints: options.followReprints,
          label: source.label,
        }));
      });
    });

    runs.forEach((run, index) => {
      run.categories.push({
        key: category.key,
        sources: perRun[index],
        total: mergeStats(category.label, perRun[index]),
      });
    });
  });

  const newestDate = dataDates.sort((a, b) => b - a)[0];

  const meta = {
    dataDir: path.relative(ROOT, options.dataDir) || options.dataDir,
    lang: options.lang,
    dataDate: newestDate ? newestDate.toISOString().slice(0, 10) : 'unbekannt',
    includeUnpublished: options.includeUnpublished,
    includeVirtualGraphics: options.includeVirtualGraphics,
    followReprints: options.followReprints,
    byType: options.byType,
  };

  return {
    meta,
    scenarios: runs.map((run) => ({
      key: run.key,
      label: run.label,
      categories: run.categories,
      total: mergeStats('Gesamt', run.categories.map((category) => category.total)),
      exclusions: {
        ...run.exclusions,
        unmatched: [...run.exclusions.ids].filter((id) => !run.matchedExcludedIds.has(id)),
      },
      meta,
    })),
  };
};

/** Einzelnes Szenario – die Form, die count-images.js ausgibt. */
const collect = function collect(options, exclusions) {
  const { scenarios } = collectScenarios(options, [{ key: 'default', label: '', exclusions }]);
  return scenarios[0];
};

module.exports = {
  collect,
  collectScenarios,
  ROOT,
};
