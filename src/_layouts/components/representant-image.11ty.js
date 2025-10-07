exports.getRepresentant = (eleventy, { content }) => {
  const src = content.metadata.imgSrc;
  const alt = content.metadata.title;

  const getImageDimensions = () => {
    const dimensions = content?.images?.overall?.images[0]?.sizes?.small?.dimensions;
    if (dimensions === undefined) return '';
    const { width, height } = dimensions;
    return `width="${width}" height="${height}"`;
  };

  const imageDimensions = getImageDimensions();

  return `
    <figure class="leporello-recog__image">
      <img loading="lazy" src="${src}" alt="${eleventy.altText(alt)}"${imageDimensions}>
    </figure>
  `;
};