exports.getDocumentStripe = (eleventy, { content }, langCode, config, hasSeperator = false, isExpanded = false) => {
  if (!content.documents) return null;
  const { documents } = content;
  const { contentTypes } = config;
  const prefix = content.inventoryNumberPrefix;

  const documentsPath = content.objectName
    ? `${config.documentsBasePath}/${prefix}${content.inventoryNumber}_${content.objectName}`
    : `${config.documentsBasePath}/${prefix}${content.inventoryNumber}`;

  const documentStripe = Object.keys(contentTypes).map((typeData) => {
    const key = typeData;
    if (!documents || !documents[key]) return null;
    const items = documents[key];
    const { sort } = contentTypes[typeData];
    const { fragment } = contentTypes[typeData];
    const html = items.map((item) => {
      const url = `${documentsPath}/${sort}_${fragment}/${item.id}.pdf`;
      eleventy.checkRessource(url);
      return `
      <li>
        <a href="${url}" class="has-interaction is-download-link">
          <span data-filetype="pdf"></span>${item.id}.pdf</a>
      </li>
      `;
    });
    return (html.join(''));
  });

  const seperator = hasSeperator ? 'has-strong-separator' : '';
  const expanded = !!isExpanded;

  return (Object.keys(documents).length === 0)
    ? ''
    : `
    <div class="foldable-block ${seperator}">
      <h2 class="foldable-block__headline is-expand-trigger js-expand-trigger" data-js-expanded="${expanded}" data-js-expandable="document-stripe">
        ${eleventy.translate('documents', langCode)}</h2>
      <div id="document-stripe" class="expandable-content document-stripe">
        <ul class="document-stripe-list">
          ${documentStripe.join('')}
        </ul>
      </div>
    </div>
  `;
};
