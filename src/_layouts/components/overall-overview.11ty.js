exports.getOverallOverview = (eleventy, { content }, langCode) => {
  const imageStack = content.images;
  const overallOverview = imageStack?.overall?.images?.filter((image) => image.id.match(/Overall_Overview/));
  if (overallOverview === undefined || overallOverview?.length === 0) return '';
  const imageData = overallOverview[0].sizes.small;

  return `
    <figure class="overall-overview">
      <img loading="lazy" src="${eleventy.url(imageData.src)}" 
        alt="${eleventy.translate('overallViewOfThePiece', langCode)}" 
        width="${imageData.dimensions.width}" 
        height="${imageData.dimensions.height}"/>
    </figure>
  `;
};
