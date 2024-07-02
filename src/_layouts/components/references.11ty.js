const overallOverviewSnippet = require('./overall-overview.11ty');

const getReferencesForPaintings = (content) => content.references;
const getReferencesForGraphics = (content) => content.references;


exports.getReference = (eleventy, data, langCode, type, isOpen = false) => {
  const { content } = data;
  const { entityType } = content;
  
  // Filterung der Referenztypen um zu den richtigen Daten zu kommen zwischen Gemälden, virtuellen Grafiken und realen Grafiken.
  const references = entityType === 'paintings'
    ? getReferencesForPaintings(content):
    type === 'IDENTICAL_WATERMARK'
    ? getReferencesForGraphics(content).watermark:
    type === 'ON_SAME_SHEET'
    ? getReferencesForGraphics(content).sameSheet:
    getReferencesForGraphics(content).relatedWorks;

  const overallOverview = overallOverviewSnippet.getOverallOverview(eleventy, data, langCode);
  
  const getTypeContent = (refType) => {
    const baseUrl = eleventy.getBaseUrl();
    const typeContentItems = references.filter((item) => item.kind === refType);
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
