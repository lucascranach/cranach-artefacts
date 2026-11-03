// Titel von Archivalien sind Zusammenfassungen und enden mit einem Punkt. Steht
// danach das Datum, würde der Punkt direkt vor dem Komma stehen – daher entfällt er.
const stripTrailingPeriod = (title) => title.replace(/([^.])\.\s*$/, '$1');

exports.getImageDescriptionObjectInfo = ({ content }) => {
  const rawTitle = content.virtualTitle || content.metadata.title || '';
  const date = content.metadata.date ? `, ${content.metadata.date}` : '';
  const title = date ? stripTrailingPeriod(rawTitle) : rawTitle;
  const attribution = !content.metadata.subtitle ? '' : `<li class="image-description-text has-small-separator">${content.metadata.subtitle}</li>`;

  return `
    <ul class="image-caption">
      <li class="image-caption__title">${title}${date}</li>
      ${attribution}
    </ul>
  `;
};
