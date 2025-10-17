const getDataList = (eleventy, data, title) => {
  const items = data.map((item) => `<li class="info-list__item">${eleventy.markdownify(item)}</li>`);

  return items.length === 0 ? ''
    : `
    <h3 class="inner-title">${title}:</h3>
    <ul class="info-list additional-content__list">
      ${items.join('')}
    </ul>
  `;
};

const buildSection = (eleventy, inscriptionsContent, inscriptionsRaw, labelTranslationKey, langCode, elementId) => {
  const numberOfWords = 20;
  const words = inscriptionsRaw.split(/ /);
  const preview = words.length > numberOfWords ? `${words.slice(0, numberOfWords).join(' ')} …` : inscriptionsRaw;
  const label = eleventy.translate(labelTranslationKey, langCode);
  const id = elementId;

  return `
    <dl id="${id}" class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">${preview}</dd>
    </dl>
    <div id="completeData${id}" class="additional-content js-additional-content" data-is-additional-content-to="${id}">
      <h2 class="additional-content__title js-collapse-additional-content has-interaction">${label}</h2>
      ${inscriptionsContent}
    </div>
  `;
};

const getInscriptionsContent = (eleventy, content, langCode) => {
  let inscriptionsRaw = `${content.inscription}`;
  inscriptionsRaw = inscriptionsRaw.replace(/\n *?\n/sg, '\n\n');
  const inscriptionsData = inscriptionsRaw.split(/\n/);
  const inscriptionsTitle = eleventy.translate('inscriptionsInnerHeadline', langCode);
  return inscriptionsRaw ? getDataList(eleventy, inscriptionsData, inscriptionsTitle) : '';
};

const getLabelsContent = (eleventy, content, langCode) => {
  let labelsRaw = `${content.markings}`.replace(/:\n/, ': ');
  labelsRaw = labelsRaw.replace(/\n *?\n/sg, '\n\n');
  const labelsData = labelsRaw.split(/\n/);
  const titleTitle = eleventy.translate('labelsInnerHeadline', langCode);
  return labelsRaw ? getDataList(eleventy, labelsData, titleTitle) : '';
};

exports.getInscriptions = (eleventy, { content }, langCode) => {
  const inscriptions = content.inscription;
  let inscriptionsRaw = content.inscription;

  inscriptionsRaw = inscriptionsRaw.replace(/:\n/, ': ');
  inscriptionsRaw = eleventy.markdownify(inscriptionsRaw);
  const inscriptionsContent = getInscriptionsContent(eleventy, content, langCode);

  if (!inscriptions) {
    return '';
  }
  return buildSection(eleventy, inscriptionsContent, inscriptionsRaw, 'inscriptionsOuterHeadline', langCode, 'inscriptions');
};

exports.getLabels = (eleventy, { content }, langCode) => {
  const labels = content.markings;
  let labelsRaw = content.markings;

  labelsRaw = labelsRaw.replace(/:\n/, ': ');
  labelsRaw = eleventy.markdownify(labelsRaw);
  const labelsContent = getLabelsContent(eleventy, content, langCode);

  if (!labels) {
    return '';
  }
  return buildSection(eleventy, labelsContent, labelsRaw, 'labelsOuterHeadline', langCode, 'labels');
};
