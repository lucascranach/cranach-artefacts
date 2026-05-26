exports.getCopyText = (eleventy, { content }) => {
  const numberOfWords = 50;
  const fullText = content.description;
  const words = fullText.split(/ /);
  const preview = words.slice(0, numberOfWords).join(' ');
  const text = words.length > numberOfWords ? `
    <div id="switchableCopyText" data-js-switchable-content='["previewText","fullText"]'>
      <div id="previewText" class="preview-text">${eleventy.getFormatedText(preview, "no-lists", "no-heading")}</div>
      <div class="is-cut full-text" id="fullText">${eleventy.getFormatedText(fullText, "no-lists", "no-heading")}</div>
    </div>
    ` : `
      ${eleventy.getFormatedText(fullText)}
    `;
  return !content.description ? '' : text;
};

exports.getShortDescription = (eleventy, { content }, langCode) => {
  const numberOfWords = 20;
  const descriptionRaw = content.description;
  const words = descriptionRaw.split(/ /);
  const preview = words.slice(0, numberOfWords).join(' ');
  const label = eleventy.translate('shortDescription', langCode);
  const hasAdditionalContent = words.length > numberOfWords;
  const dataListData = {
    id: 'Description',
    content: descriptionRaw.split('\n'),
    isAdditionalContentTo: 'description',
    title: label,
  };

  const descriptionFulltext = hasAdditionalContent ? eleventy.getDataList(dataListData) : '';
  return !content.description ? ''
    : `
    <dl id="description" class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">${preview}</dd>
    </dl>
    ${descriptionFulltext}
    `;
};
