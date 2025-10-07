const overallOverviewSnippet = require('./overall-overview.11ty');

const getReferences = (eleventy, content, type) => {
  // const { entityType } = content;

  const referenceTypes = eleventy.getReferenceTypes();
  const { references } = content;

  if(!references) return;
  if(!referenceTypes[type]) return;
  const referenceType = referenceTypes[type];

  if(!references[referenceType]) return;
  return references[referenceType];

  // if (entityType === 'paintings') return content.references;
  // if (entityType === 'drawings') return Object.values(content.references).flat();
  // if (type === 'IDENTICAL_WATERMARK') return content.references.watermark;
  // if (type === 'ON_SAME_SHEET') return content.references.sameSheet;
  return content.references.relatedWorks;
};

const getReferences = (eleventy, content, type) => {
  // const { entityType } = content;

  const referenceTypes = eleventy.getReferenceTypes();
  const { references } = content;

  if(!references) return;
  if(!referenceTypes[type]) return;
  const referenceType = referenceTypes[type];

  if(!references[referenceType]) return;
  return references[referenceType];

  // if (entityType === 'paintings') return content.references;
  // if (entityType === 'drawings') return Object.values(content.references).flat();
  // if (type === 'IDENTICAL_WATERMARK') return content.references.watermark;
  // if (type === 'ON_SAME_SHEET') return content.references.sameSheet;
  return content.references.relatedWorks;
}

exports.getReference = (eleventy, data, langCode, type, isOpen = false) => {
  const { content } = data;
  const references = getReferences(eleventy, content, type);
  const overallOverview = type === 'PART_OF_WORK' ? overallOverviewSnippet.getOverallOverview(eleventy, data, langCode) : '';
  
  const getTypeContent = (refType) => {
    const baseUrl = eleventy.getBaseUrl();
    const typeContentItems = !references ? [] : references.filter((item) => item.kind === refType);
    const typeContentItemList = typeContentItems.map((item) => {
      const refObjectMeta = eleventy.getRefObjectMeta(content.currentCollection, item.inventoryNumber);
      const refObjectLink = `${baseUrl}/${langCode}/${refObjectMeta.id}/`;
      return `
        <div class="related-item-wrap">
          <a href="${refObjectLink}">
          <figure class="related-item">
            <div class="related-item__image">
              <img loading="lazy" src="${refObjectMeta.imgSrc}" alt="${eleventy.altText(refObjectMeta.title)}">
            </div>
            <figcaption class="related-item__caption">
              <ul>
                <li class="related-item__title">${refObjectMeta.title}, ${refObjectMeta.date}</li>
                <li class="related-item__id">${refObjectMeta.id}</li>
                <li class="related-item__text">${refObjectMeta.classification}</li>
                <li class="related-item__text">${refObjectMeta.owner}</li>
              </ul>
            </figcaption>
          </figure>
          </a>
        </div>
      `;
    });

    const state = isOpen ? 'true' : 'false';

    return typeContentItems.length === 0 ? '' : `
      <div class="foldable-block has-strong-separator">
        <h2 class="foldable-block__headline is-expand-trigger js-expand-trigger"
          data-js-expanded="${state}" data-js-expandable="${eleventy.slugify(type)}">
          ${overallOverview}
          ${eleventy.translate(type, langCode)}</h2>
        <div class="expandable-content" id="${eleventy.slugify(type)}">
        ${typeContentItemList.join('')}
        </div>
      </div>
    `;
  };

  return getTypeContent(type);
};
