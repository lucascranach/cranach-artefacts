exports.getCdaId = (eleventy, { content }) => `
<dl class="definition-list is-grid">
  <dt class="definition-list__term">CDA ID</dt>
  <dd class="definition-list__definition" data-clipable-content="${content.metadata.id}">${content.metadata.id}</dd>
</dl>
`;

exports.getIds = (eleventy, { content }, langCode) => {
  const hollsteinData = content.catalogWorkReferences.filter((item) => item.description === 'Hollstein');
  const hollsteinNr = hollsteinData[0] ? hollsteinData[0].referenceNumber : false;
  const hollsteinNrSnippet = !hollsteinNr ? ''
    : `
    <dt class="definition-list__term">${eleventy.translate('hollstein', langCode)}</dt>
    <dd class="definition-list__definition" data-clipable-content="${hollsteinNr}">${hollsteinNr}</dd>
  `;
  const kklData = content.catalogWorkReferences.filter((item) => item.description === 'KKL-Ordnungsnummer');
  const kklNr = kklData[0] ? kklData[0].referenceNumber : false;
  const kklNrSnippet = !kklNr ? ''
    : `
    <dt class="definition-list__term">${eleventy.translate('kkl', langCode)}</dt>
    <dd class="definition-list__definition" data-clipable-content="${kklNr}">${kklNr}</dd>
  `;
  const bartschData = content.catalogWorkReferences.filter((item) => item.description === 'Bartsch');
  const bartschNr = bartschData[0] ? bartschData[0].referenceNumber : false;
  const bartschNrSnippet = !bartschNr ? ''
    : `
    <dt class="definition-list__term">${eleventy.translate('bartsch', langCode)}</dt>
    <dd class="definition-list__definition" data-clipable-content="${bartschNr}">${bartschNr}</dd>
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

    <dt class="definition-list__term">${eleventy.translate('permalink', langCode)}</dt>
    <dd class="definition-list__definition" data-clipable-content="${content.url}">${content.url}</dd>
  </dl>
  `;
};
