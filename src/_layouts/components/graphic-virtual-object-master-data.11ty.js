let langCode;
let config;

const classificationSnippet = require('./classification.11ty');
const titleSnippet = require('./title.11ty');
const representantImageSnippet = require('./representant-image.11ty');
const attributionSnippet = require('./attribution.11ty');
const datingSnippet = require('./dating.11ty');
const signatureSnippet = require('./signature.11ty');
const dimensionsSnippet = require('./dimensions.11ty');
const descriptionSnippet = require('./description.11ty');
const exhibitonsSnippet = require('./exhibitons.11ty');
const identificationSnippet = require('./identification.11ty');
const sourcesSnippet = require('./sources.11ty');
const additionalTextInformationSnippet = require('./additional-text-information.11ty');
const referencesSnippet = require('./references.11ty');

const PART_OF_SERIES = 'PART_OF_SERIES';

const getLangCode = ({ content }) => content.metadata.langCode;

const getHeader = (eleventy, data) => {
  const title = titleSnippet.getTitle(eleventy, data, langCode);
  const subtitle = classificationSnippet.getClassification(eleventy, data, langCode);
  return `
  <header class="artefact-header">
    ${title}
    ${subtitle}
  </header>`;
};

// eslint-disable-next-line func-names
exports.getMasterData = (eleventy, pageData) => {
  const data = pageData;
  langCode = getLangCode(data);
  config = eleventy.getConfig();

  data.content.currentCollection = data.collections[data.collectionID];
  data.content.entityType = data.entityType;
  data.content.url = `${eleventy.getBaseUrl()}${data.page.url}`;

  eleventy.log(data);

  const header = getHeader(eleventy, data, langCode);
  const attribution = attributionSnippet.getAttribution(eleventy, data, langCode);
  const dating = datingSnippet.getDating(eleventy, data, langCode);
  const copy = descriptionSnippet.getCopyText(eleventy, data);
  const image = representantImageSnippet.getRepresentant(eleventy, data);
  const dimensions = dimensionsSnippet.getDimensions(eleventy, data, langCode);
  const signature = signatureSnippet.getSignature(eleventy, data, langCode);
  const ids = identificationSnippet.getIds(eleventy, data, langCode);
  const exhibitions = exhibitonsSnippet.getExhibitions(eleventy, data, langCode);
  const additionalTextInformation = additionalTextInformationSnippet.getAdditionalTextInformation(eleventy, data, langCode);
  const primarySources = sourcesSnippet.getPrimarySources(eleventy, data, langCode, true);
  const nonPrimarySources = sourcesSnippet.getNonPrimarySources(eleventy, data, langCode, true);
  const partOfSeries = referencesSnippet.getReference(eleventy, data, langCode, PART_OF_SERIES);


  return `
    <section class="leporello-recog js-main-content">
      ${image}
      <div class="leporello-recog__text">
        <div class="grid-wrapper">
          ${header}
        </div>
        <div class="grid-wrapper">
          <div class="main-column">
            <div class="copytext">
              ${copy}
            </div>
            <div class="block">
              ${attribution}
              ${dating}
              ${dimensions}
              ${signature}
            </div>
            <div class="block">
              ${ids}
            </div>
          </div>
          <div class="marginal-content">
            ${partOfSeries}
            ${exhibitions}
            ${primarySources}
            ${nonPrimarySources}
            ${additionalTextInformation}
          </div>
        </div>
      </div>
    </section>
  `;
};
