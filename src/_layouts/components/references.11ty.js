const overallOverviewSnippet = require('./overall-overview.11ty');

const getReferences = (eleventy, content, type) => {
  // const { entityType } = content;

  const referenceTypes = eleventy.getReferenceTypes();
  const { references } = content;

  if (!references) return null;
  if (!referenceTypes[type]) return null;
  const referenceType = referenceTypes[type];

  if (!references[referenceType]) return null;
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
    const maxContentItems = 4;
    const baseUrl = eleventy.getBaseUrl();
    let typeContentItemsOverlay = null;
    let typeContentItems = !references ? [] : references.filter((item) => item.kind === refType);
    const countConentItems = typeContentItems.length;
    if (typeContentItems.length > maxContentItems) {
      typeContentItemsOverlay = typeContentItems;
      typeContentItems = typeContentItems.slice(0, maxContentItems);
    }

    const typeContentItemList = typeContentItems.map((item) => {
      const refObjectMeta = eleventy.getRefObjectMeta(item.inventoryNumber, langCode);
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
          ${eleventy.translate(type, langCode)}<span class="foldable-block__count">${countConentItems}</span></h2>
        <div class="expandable-content" id="${eleventy.slugify(type)}">
        ${typeContentItemList.join('')}
        ${typeContentItemsOverlay ? `
          <button class="button" data-js-overlay-open='{"target":"${eleventy.slugify(type)}"}'> ${eleventy.translate('SHOW_ALL', langCode)}</button>

          <dialog class="overlay overlay--maximized" data-js-overlay-target="${eleventy.slugify(type)}">
          <div class="overlay__header">
            <h2>${eleventy.translate(type, langCode)}<h2>
              <button class="button button--is-transparent button__icon--is-large
              overlay__close" data-js-overlay-close>
              </button>
          </div>
        <ul class="overlay__grid">
          ${typeContentItemsOverlay.map((item) => {
    const refObjectMeta = eleventy.getRefObjectMeta(item.inventoryNumber, langCode);
    const refObjectLink = `${baseUrl}/${langCode}/${refObjectMeta.id}/`;
    return `
          <li class="overlay__item">
            <a href="${refObjectLink}" class="overlay__link">
              <figure>
                <img loading="lazy" src="${refObjectMeta.imgSrc}" alt="${eleventy.altText(refObjectMeta.title)}">
                <figcaption>
                    <h3>${refObjectMeta.title}, ${refObjectMeta.date}</h3>
                    <h4>${refObjectMeta.id}</h4>
                    <p>${refObjectMeta.classification}</p>
                    <p>${refObjectMeta.owner}</p>
                </figcaption>
              </figure>
            </a>
          </li>
          `;
  }).join('')}
          </ul>            
          </dialog>
        ` : ''}
        </div>
      </div>
    `;
  };

  return getTypeContent(type);
};
