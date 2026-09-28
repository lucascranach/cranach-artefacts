/**
 * Laedt die Ausschlussliste (Cranach-IDs, die nicht mitgezaehlt werden sollen).
 *
 * Die Liste ist nach Gruppen organisiert, damit mehrere Kataloge nebeneinander
 * gepflegt und einzeln zu- bzw. abgeschaltet werden koennen.
 */

const fs = require('fs');

const loadExclusions = function loadExclusions(file, options) {
  const { only, disabled } = options;

  const result = {
    file,
    groups: [],
    ids: new Set(),
  };

  if (disabled) return result;

  if (!fs.existsSync(file)) {
    throw new Error(`Ausschlussliste nicht gefunden: ${file}`);
  }

  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  const groups = parsed && parsed.groups && typeof parsed.groups === 'object' ? parsed.groups : {};

  if (only.length) {
    const unknown = only.filter((name) => !Object.keys(groups).includes(name));
    if (unknown.length) {
      throw new Error(`Unbekannte Gruppe(n) in der Ausschlussliste: ${unknown.join(', ')}`);
    }
  }

  Object.entries(groups).forEach(([name, group]) => {
    const ids = group && Array.isArray(group.ids) ? group.ids.filter(Boolean) : [];
    const active = only.length ? only.includes(name) : group.active !== false;

    result.groups.push({
      name,
      label: (group && group.label) || name,
      comment: (group && group.comment) || '',
      active,
      ids,
    });

    if (active) ids.forEach((id) => result.ids.add(id));
  });

  return result;
};

const listGroups = function listGroups(file) {
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  const groups = parsed && parsed.groups ? parsed.groups : {};

  return Object.entries(groups).map(([name, group]) => ({
    name,
    label: (group && group.label) || name,
    comment: (group && group.comment) || '',
    active: group.active !== false,
    count: group && Array.isArray(group.ids) ? group.ids.length : 0,
  }));
};

module.exports = {
  loadExclusions,
  listGroups,
};
