/**
 * Zaehllogik fuer digitalisierte Abbildungen.
 *
 * Eine "Abbildung" ist ein Eintrag in `images.<bildtyp>.images[]`. Automatisch
 * erzeugte Overview-Derivate (IDs auf `_Overview`) sind keine eigenstaendigen
 * Abbildungen und werden herausgerechnet.
 */

const OVERVIEW_SUFFIX = '_Overview';
const REPRINT_KIND = 'REPRINT_OF';

const isOverviewImage = (image) => typeof image.id === 'string'
  && image.id.endsWith(OVERVIEW_SUFFIX);

/**
 * Downloadbarkeit laut Datenbestand. Das Flag steht sowohl an der Abbildung als
 * auch an den einzelnen Groessen; beide werden geprueft, damit eine kuenftige
 * Aufweichung der Konsistenz nicht stillschweigend untergeht.
 */
const isDownloadable = (image) => {
  if (image.download === true) return true;

  const sizes = image.sizes && typeof image.sizes === 'object' ? Object.values(image.sizes) : [];
  return sizes.some((size) => size && size.download === true);
};

/**
 * Virtuelle Grafiken sind konzeptionelle Container fuer die realen Abzuege.
 * Ein realer Abzug verweist ueber `references.reprints[]` (kind REPRINT_OF) auf
 * seinen Container. Wird der Container ausgeschlossen, muessen die Abzuege
 * mitgehen – auch dann, wenn der Container selbst gar nicht mitgezaehlt wird.
 *
 * Der Prefix (`inventoryNumberPrefix`, in der Praxis 'GWN_') gehoert nicht zur
 * Cranach-ID; beide Schreibweisen werden geprueft.
 */
const reprintTargets = (item) => {
  const refs = item.references && item.references.reprints;
  if (!Array.isArray(refs)) return [];

  return refs
    .filter((ref) => ref && ref.kind === REPRINT_KIND && ref.inventoryNumber)
    .flatMap((ref) => [
      ref.inventoryNumber,
      `${ref.inventoryNumberPrefix || ''}${ref.inventoryNumber}`,
    ]);
};

const createTypeBucket = () => ({ images: 0, downloadable: 0, works: 0 });

const createStats = (label) => ({
  label,
  works: 0,
  worksExcluded: 0,
  worksExcludedViaReprint: 0,
  worksUnpublished: 0,
  worksWithImages: 0,
  worksWithDownloadableImages: 0,
  images: 0,
  downloadable: 0,
  overviewSkipped: 0,
  duplicateIds: 0,
  byType: {},
});

const bucketFor = (stats, type) => {
  if (!stats.byType[type]) stats.byType[type] = createTypeBucket();
  return stats.byType[type];
};

/**
 * Zaehlt eine Quelldatei aus.
 *
 * @param {Array} items Werke aus `items[]`
 * @param {Object} options
 * @param {Set<string>} options.excludedIds Cranach-IDs, die uebersprungen werden
 * @param {Set<string>} options.matchedExcludedIds wird mit tatsaechlich getroffenen IDs befuellt
 * @param {boolean} options.includeUnpublished unveroeffentlichte Werke mitzaehlen
 * @param {boolean} options.followReprints Ausschluss auf reale Abzuege ausweiten
 * @param {string} options.label Anzeigename der Quelle
 */
const countSource = function countSource(items, options) {
  const {
    excludedIds,
    matchedExcludedIds,
    includeUnpublished,
    followReprints,
    label,
  } = options;

  const stats = createStats(label);
  const seenIds = new Set();

  items.forEach((item) => {
    const metadata = item.metadata || {};
    const id = metadata.id || item.inventoryNumber || '';

    if (excludedIds.has(id)) {
      matchedExcludedIds.add(id);
      stats.worksExcluded += 1;
      return;
    }

    if (followReprints) {
      const container = reprintTargets(item).find((target) => excludedIds.has(target));

      if (container) {
        matchedExcludedIds.add(container);
        stats.worksExcluded += 1;
        stats.worksExcludedViaReprint += 1;
        return;
      }
    }

    if (!includeUnpublished && metadata.isPublished === false) {
      stats.worksUnpublished += 1;
      return;
    }

    if (id) {
      if (seenIds.has(id)) stats.duplicateIds += 1;
      seenIds.add(id);
    }

    stats.works += 1;

    let workImages = 0;
    let workDownloadable = 0;
    const typesOfWork = new Set();

    const groups = item.images && typeof item.images === 'object' ? item.images : {};

    Object.entries(groups).forEach(([type, group]) => {
      const images = group && Array.isArray(group.images) ? group.images : [];

      images.forEach((image) => {
        if (!image) return;

        if (isOverviewImage(image)) {
          stats.overviewSkipped += 1;
          return;
        }

        const bucket = bucketFor(stats, type);
        bucket.images += 1;
        workImages += 1;
        typesOfWork.add(type);

        if (isDownloadable(image)) {
          bucket.downloadable += 1;
          workDownloadable += 1;
        }
      });
    });

    stats.images += workImages;
    stats.downloadable += workDownloadable;
    if (workImages > 0) stats.worksWithImages += 1;
    if (workDownloadable > 0) stats.worksWithDownloadableImages += 1;
    typesOfWork.forEach((type) => { bucketFor(stats, type).works += 1; });
  });

  return stats;
};

const mergeStats = function mergeStats(label, statsList) {
  const merged = createStats(label);

  statsList.forEach((stats) => {
    [
      'works', 'worksExcluded', 'worksExcludedViaReprint', 'worksUnpublished',
      'worksWithImages', 'worksWithDownloadableImages', 'images', 'downloadable',
      'overviewSkipped', 'duplicateIds',
    ].forEach((field) => { merged[field] += stats[field]; });

    Object.entries(stats.byType).forEach(([type, bucket]) => {
      const target = bucketFor(merged, type);
      target.images += bucket.images;
      target.downloadable += bucket.downloadable;
      target.works += bucket.works;
    });
  });

  return merged;
};

module.exports = {
  countSource,
  mergeStats,
  isOverviewImage,
  isDownloadable,
  reprintTargets,
};
