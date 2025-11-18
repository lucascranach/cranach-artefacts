exports.getImageStripe = (eleventy, { content }, langCode, config, hasSeperator = false, isExpanded = false) => {
  const imageStack = content.images;
  const { contentTypes } = config;
  const cdaId = content.metadata.id;
  const objectTitle = eleventy.altText(content.metadata.title);

  const imageStripe = Object.keys(contentTypes).map((key) => {
    if (!imageStack || !imageStack[key]) return '';
    const { images } = imageStack[key];

    const filteredImages = images.filter(item => {
      if(item.sizes.origin.src.match(/Overall_Overview/)) return false;
      return true;
    });
    const html = filteredImages.map((image) => {
      const title = image.metadata && image.metadata[langCode]
        ? eleventy.altText(image.metadata[langCode].description)
        : `${key}`;
      const isDownloadable = image.download && image.download === true;

      // Prepare download sizes data for tooltip
      const downloadSizes = image.sizes ? Object.keys(image.sizes)
        .map((size) => ({
          size,
          src: image.sizes[size].src,
          dimensions: image.sizes[size].dimensions,
        })) : [];

      const downloadSpan = isDownloadable && downloadSizes.length > 0
        ? `<button class="download-interaction" 
             role="button" 
             title="${eleventy.translate ? eleventy.translate('downloadIllustration', langCode) : 'Download'}" 
             data-js-overlay-open='{"target":"download"}'
             data-js-image-download='${JSON.stringify(downloadSizes)}'>
           </button>`
        : '';

      const buttonContainer = `
          <div class="image-buttons-container js-is-collectable">
            ${downloadSpan}
          </div>`;

      return `
        <li
          class="image-stripe-list__item has-interaction js-is-collectable"
          title="${image.id}"
          data-collected="false"
          data-cda-id="${cdaId}"
          data-object-title="${objectTitle}"
          data-image-type="${key}"
          data-image-id="${image.id}"
          data-image-preview-url="${image.sizes.small.src}"
          data-image-tiles-url="${image.sizes.tiles.src}"
          data-js-change-image='{"key":"${key}","id":"${image.id}"}'>
          <img loading="lazy" src="${image.sizes.small.src}" alt="${title}" >
          ${buttonContainer}
        </li>
      `;
    });
    return (html.join(''));
  });

  const availablecontentTypes = Object.keys(contentTypes).map((key) => {
    if (!imageStack || !imageStack[key]) return '';
    const numberOfImages = imageStack[key].images.length;
    const type = (numberOfImages === 0) ? '' : `<option value="${key}">${eleventy.translate(key, langCode)} (${numberOfImages})</option>`;
    return type;
  });

  const imageTypeselector = `
    <div class="imagetype-selector">
      <select size="1" data-js-image-selector="true">
        <option value="all">${eleventy.translate('all', langCode)}</option>
        ${availablecontentTypes.join('')}
      </select>
    </div>
  `;

  const cranachCollectBaseUrl = eleventy.getCranachCollectBaseUrl();
  const cranachCollectFrontend = config.cranachCollect.frontend;
  const cranachCompare = `
    <a class="cranach-compare-launcher js-cranach-compare-launcher"
      href="${cranachCollectBaseUrl}${cranachCollectFrontend}"
      data-visible="false" 
      target="_blank">
      ${eleventy.translate('compareImages', langCode)}
    </a>
  `;

  const seperator = hasSeperator ? 'has-strong-separator' : '';
  const expanded = !!isExpanded;

  return `
    <div class="foldable-block ${seperator}">
      <h2 class="foldable-block__headline is-expand-trigger js-expand-trigger" data-js-expanded="${expanded}" data-js-expandable="image-stripe">
        ${eleventy.translate('illustrations', langCode)}</h2>
      <div id="image-stripe" class="expandable-content image-stripe">
        <div class="image-stripe-navigation">
          ${imageTypeselector}
          ${cranachCompare}
        </div>
        <ul class="image-stripe-list">
          ${imageStripe.join('')}
        </ul>
      </div>
    </div>
    
    <!-- Download Overlay -->
    <dialog class="overlay download-overlay" data-js-overlay-target="download">
      <div class="overlay__header">
        <h2>
          ${eleventy.translate ? eleventy.translate('downloadIllustration', langCode) : 'Abbildung herunterladen'}
        </h2>
        <h2>
        <button class="button button--is-transparent button__icon--is-large overlay__close" data-js-overlay-close></button>
        </h2>
      </div>
      <div class="download-overlay__main">
        <div class="download-overlay__preview" data-js-download-preview>
          <!-- Preview image will be inserted here by JavaScript -->
        </div>
        <ul class="download-overlay__list" data-js-download-sizes-list>
          <!-- Download links will be inserted here by JavaScript -->
        </ul>
      </div>
      <div class="download-overlay__license">
        <p class="download-overlay__license-info">
            ${eleventy.translate ? eleventy.translate('license', langCode) : 'Lizenz:'} 
            <a href="https://creativecommons.org/licenses/by/4.0/deed.de" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="download-overlay__license-link">
              ${eleventy.translate('licenseText', langCode)}
            </a>
        </p>
      </div>
    </dialog>
  `;
};
