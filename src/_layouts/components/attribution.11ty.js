exports.getAttribution = (eleventy, { content }, langCode) => {
  const prefix = content.metadata.id;
  const numberOfItems = 2;
  let additionalCellClass = '';
  const getAttributer = (item) => {
    const fragments = [];
    const { entityType } = content;

    if (item.prefix) fragments.push(item.prefix);
    if (item.name) fragments.push(item.name);
    if (item.suffix) fragments.push(item.suffix);

    const fullName = fragments.join(' ');

    if (!entityType || !entityType.match(/graphics/)) return fullName;

    const nameAndRole = [];
    nameAndRole.push(fullName);
    if (item.role) nameAndRole.push(item.role);
    if (nameAndRole.length > 0) additionalCellClass = 'is-wide';

    return nameAndRole.join(', ');
  };

  const attributionShortListItems = content.involvedPersons.slice(0, numberOfItems);
  const attributionShortList = attributionShortListItems.map((item) => getAttributer(item));
  const attributionFullList = content.involvedPersons.map((item) => ({ text: `${getAttributer(item)}`, remark: item.remarks }));
  const label = content.involvedPersons.length > 1 ? eleventy.translate('attributions', langCode) : eleventy.translate('attribution', langCode);
  const remarkDataTableData = {
    id: 'Attributions',
    content: attributionFullList,
    isAdditionalContentTo: `${prefix}-attributionData`,
    title: label,
    context: prefix,
    additionalCellClass,
  };
  const allAttributions = eleventy.getRemarkDataTable(remarkDataTableData);

  return content.involvedPersons.length === 0 ? '' : `
    <dl id="${prefix}-attributionData" class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">
        ${attributionShortList.join('<br>')}
      </dd>
    </dl>
    ${allAttributions}
  `;
};

exports.getPrinter = (eleventy, { content }, langCode) => {
  const printers = content.involvedPersons.filter((person) => person.roleType === 'PRINTER');

  if (printers.length === 0) return '';

  const label = printers.length > 1 ? eleventy.translate('printers', langCode) : eleventy.translate('printer', langCode);
  const printerNames = printers.map((person) => {
    const fragments = [];
    if (person.prefix) fragments.push(person.prefix);
    if (person.name) fragments.push(person.name);
    if (person.suffix) fragments.push(person.suffix);
    return fragments.join(' ');
  });

  return `
    <dl class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">${printerNames.join('<br>')}</dd>
    </dl>
  `;
};

exports.getPublisher = (eleventy, { content }, langCode) => {
  const publishers = content.involvedPersons.filter((person) => person.roleType === 'PUBLISHER');

  if (publishers.length === 0) return '';

  const label = publishers.length > 1 ? eleventy.translate('publishers', langCode) : eleventy.translate('publisher', langCode);
  const publisherNames = publishers.map((person) => {
    const fragments = [];
    if (person.prefix) fragments.push(person.prefix);
    if (person.name) fragments.push(person.name);
    if (person.suffix) fragments.push(person.suffix);
    return fragments.join(' ');
  });

  return `
    <dl class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">${publisherNames.join('<br>')}</dd>
    </dl>
  `;
};

exports.getOfficin = (eleventy, { content }, langCode) => {
  const officins = content.involvedPersons.filter((person) => person.roleType === 'OFFICIN');

  if (officins.length === 0) return '';

  const label = officins.length > 1 ? eleventy.translate('officins', langCode) : eleventy.translate('officin', langCode);
  const officinNames = officins.map((person) => {
    const fragments = [];
    if (person.prefix) fragments.push(person.prefix);
    if (person.name) fragments.push(person.name);
    if (person.suffix) fragments.push(person.suffix);
    return fragments.join(' ');
  });

  return `
    <dl class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">${officinNames.join('<br>')}</dd>
    </dl>
  `;
};
