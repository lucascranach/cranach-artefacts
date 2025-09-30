const kklGroupLink = (eleventy, kklNr, langCode) => {
  if (!kklNr) return '';
  const kklGroupLinkData = eleventy.getKklGroupLinkData(kklNr, langCode);
  const { kklGroupId } = kklGroupLinkData;
  const { url } = kklGroupLinkData;

  return kklGroupId === 'partOfAppendix'
    ? `<span>, ${eleventy.translate('partOfAppendix', langCode)}</span>`
    : `<span>, <a href="${url}" class="is-link">${eleventy.translate('partOfImageGroup', langCode)} ${kklGroupId}</a></span>`;
};

exports.getPermalink = (eleventy, url, langCode) => `
    <dl class="definition-list is-grid">
      <dt class="definition-list__term">${eleventy.translate('permalink', langCode)}</dt>
      <dd class="definition-list__definition" data-clipable-content="${url}"><a href="${url}">${url}</a></dd>
    </dl>
  `;

exports.getCdaId = (eleventy, { content }) => `
<dl class="definition-list is-grid">
  <dt class="definition-list__term">CDA ID</dt>
  <dd class="definition-list__definition" data-clipable-content="${content.metadata.id}">${content.metadata.id}</dd>
</dl>
`;

exports.getIds = (eleventy, { content }, langCode) => {
  const hollsteinData = content.catalogWorkReferences
    ? content.catalogWorkReferences.filter((item) => item.description === 'Hollstein')
    : false;
  const hollsteinNr = hollsteinData[0] ? hollsteinData[0].referenceNumber : false;
  const hollsteinNrSnippet = !hollsteinNr ? ''
    : `
    <dt class="definition-list__term">${eleventy.translate('hollstein', langCode)}</dt>
    <dd class="definition-list__definition" data-clipable-content="${hollsteinNr}">${hollsteinNr}</dd>
  `;
  const kklData = content.catalogWorkReferences
    ? content.catalogWorkReferences.filter((item) => item.description === 'KKL-Ordnungsnummer')
    : false;
  const kklNr = kklData[0] ? kklData[0].referenceNumber : false;
  const linkToKklGroup = kklGroupLink(eleventy, kklNr, langCode);
  const kklNrSnippet = !kklNr ? ''
    : `
    <dt class="definition-list__term">${eleventy.translate('kkl', langCode)}</dt>
    <dd class="definition-list__definition">${kklNr}${linkToKklGroup}</dd>
  `;

  const bartschData = content.catalogWorkReferences
    ? content.catalogWorkReferences.filter((item) => item.description === 'Bartsch')
    : false;

  const bartschNr = bartschData[0] ? bartschData[0].referenceNumber : false;
  const bartschNrSnippet = !bartschNr ? ''
    : `
    <dt class="definition-list__term">${eleventy.translate('bartsch', langCode)}</dt>
    <dd class="definition-list__definition" data-clipable-content="${bartschNr}">${bartschNr}</dd>
  `;

  const gndData = content.catalogWorkReferences
    ? content.catalogWorkReferences.filter((item) => item.description === 'GND')
    : false;

  const gndNr = gndData[0] ? gndData[0].referenceNumber : false;
  const gndNrSnippet = !gndNr ? ''
    : `
    <dt class="definition-list__term">${eleventy.translate('gnd', langCode)}</dt>
    <dd class="definition-list__definition" data-clipable-content="${gndNr}">${gndNr}</dd>
  `;

  const frNr = content.objectName ? content.objectName : false;
  const frNrSnippet = !frNr ? ''
    : `
    <dt class="definition-list__term">${eleventy.translate('objectName', langCode)}</dt>
    <dd class="definition-list__definition" data-clipable-content="${frNr}">${frNr}</dd>
  `;

  return `
    <dl class="definition-list is-grid">
    <dt class="definition-list__term">CDA ID</dt>
    <dd class="definition-list__definition" data-clipable-content="${content.metadata.id}">${content.metadata.id}</dd>
    ${frNrSnippet}
    ${kklNrSnippet}
    ${hollsteinNrSnippet}
    ${bartschNrSnippet}
    ${gndNrSnippet}
    <dt class="definition-list__term">${eleventy.translate('permalink', langCode)}</dt>
    <dd class="definition-list__definition" data-clipable-content="${content.url}"><a href="${content.url}">${content.url}</a></dd>
  </dl>
  `;
};
