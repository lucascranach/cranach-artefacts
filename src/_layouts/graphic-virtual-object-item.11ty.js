let langCode;
let config;

const metaDataHeader = require('./components/meta-data-head.11ty');
const improveCda = require('./components/improve-cda.11ty');
const pageDateSnippet = require('./components/page-date.11ty');
const copyrightSnippet = require('./components/copyright.11ty');
const citeCdaSnippet = require('./components/cite-cda.11ty');
const masterDataSnippet = require('./components/graphic-virtual-object-master-data.11ty');
const graphicsRealObject = require('./components/graphic-real-object.11ty');
const navigationSnippet = require('./components/navigation.11ty');

const getimageBaseUrl = () => JSON.stringify(config.imageTiles);
const getClientTranslations = () => JSON.stringify(this.getClientTranslations());
const getLangCode = ({ content }) => content.metadata.langCode;
const getDocumentTitle = ({ content }) => content.metadata.title;

const generateReprint = (eleventy, id, masterData) => {
  const data = {
    content: eleventy.getReprintData(id, langCode),
  };
  const path = `${config.dist}/${langCode}/${id}`;
  const filename = 'index.html';

  const baseUrl = eleventy.getBaseUrl();
  data.content.url = `${baseUrl}/${langCode}/${id}`;

  const reprint = graphicsRealObject.getRealObject(eleventy, data, langCode, masterData);
  eleventy.writeDocument(path, filename, reprint);
};

const getReprints = (eleventy, { content }, conditionLevel, secondConditionLevel = false) => {
  if (!content.references.reprints) return '';

  const reprintsListData = [...content.references.reprints];
  const reprintsListRefData = reprintsListData.map((item) => eleventy.getReprintRefItem(item.inventoryNumber, langCode, conditionLevel));

  const checkConditionLevel = (item) => {
    if (!item) return false;
    if (item.conditionLevel === conditionLevel) return true;
    if (secondConditionLevel !== false && item.conditionLevel === secondConditionLevel) return true;

    return false;
  };

  const reprints = reprintsListRefData.filter(checkConditionLevel).sort((a, b) => a.sortingNumber.localeCompare(b.sortingNumber));
  const state = eleventy.translate(`${conditionLevel}-state`, langCode);
  const baseUrl = eleventy.getBaseUrl();
  const { masterData } = content;

  const reprintsList = reprints.map(
    (item) => {
      generateReprint(eleventy, item.id, masterData);
      const url = `${baseUrl}/${langCode}/${item.id}/`;
      const title = eleventy.altText(item.title);
      const cardText = [];
      if (item.date) cardText.push(item.date);
      if (item.repository) cardText.push(item.repository);

      return `
        <figure class="artefact-card">
          <a href="${url}" class="js-go-to-reprint">
            <div class="artefact-card__image-holder">
              <img src="${item.imgSrc}" alt="${title}" loading="lazy">
            </div>
            <figcaption class="artefact-card__content">
              <p class="artefact-card__text">${cardText.join(', ', cardText)}</p>
            </figcaption>
          </a>
        </figure>
      `;
    },
  );

  // condition = zustand, edition = auflage
  // TODO: Filter editions only for selected condition
  // TODO: Filter reprints only for current edition
  const editions = content.dating.historicEventInformations.filter(((event) => event.eventType === 'EDITION'));

  const editionsList = editions.map((edition) => {
    const letter = edition.remarks.substring(0, edition.remarks.indexOf(' '));
    const description = edition.remarks.substring(edition.remarks.indexOf(' ') + 1);
    return `
      <details style="">
        <summary>Auflage ${letter}: ${edition.text}</summary>
        <p>${description}</p>
        <div class="reprints-gallery">
          ${reprintsList.join('')}
        </div>
      </details>
    `;
  });

  return reprints.length === 0 ? '' : `
    <div class="reprints-block block">
      <h3 class="reprints-state">${state}</h3>
      <div class="artefact-overview">
        ${editionsList.join('')}
      </div>
    </div>
  `;
};

const getMasterData = (data) => {
  const masterData = masterDataSnippet.getMasterData(this, data, langCode);
  return masterData;
};

// eslint-disable-next-line func-names
exports.render = function (pageData) {
  const data = pageData;
  langCode = getLangCode(data);
  config = this.getConfig();

  data.content.currentCollection = data.collections[data.collectionID];
  data.content.entityType = data.entityType;
  data.content.url = `${this.getBaseUrl()}${data.page.url}`;
  data.content.masterData = getMasterData(data, langCode);
  this.log(data);

  const { id } = data.content.metadata;
  const { masterData } = data.content;
  const documentTitle = getDocumentTitle(data);
  const baseUrl = this.getBaseUrl();
  const imageBaseUrl = getimageBaseUrl(data);
  const metaDataHead = metaDataHeader.getHeader(data);
  const translationsClient = getClientTranslations(data);
  const citeCda = citeCdaSnippet.getCiteCDA(this, data, langCode);
  const improveCdaSnippet = improveCda.getImproveCDA(this, data, config, langCode);
  const copyright = copyrightSnippet.getCopyright();
  const pageDate = pageDateSnippet.getPageDate(this, langCode);
  const reprintsLevel1 = getReprints(this, data, 1, 0);
  const reprintsLevel2 = getReprints(this, data, 2);
  const reprintsLevel3 = getReprints(this, data, 3);
  const reprintsLevel4 = getReprints(this, data, 4);
  const reprintsLevel5 = getReprints(this, data, 5);
  const navigation = navigationSnippet.getNavigation(this, langCode, id);

  const cranachCollectBaseUrl = this.getCranachCollectBaseUrl();
  const cranachCollectScript = config.cranachCollect.script;

  return `<!doctype html> 
  <html lang="${langCode}">
    <head>
      <title>cda :: ${this.translate('prints', langCode)} :: ${documentTitle}</title>
      ${metaDataHead}
      <link href="${this.url('/compiled-assets/main.css')}" rel="stylesheet">
      <link href="${this.url('/assets/images/favicon.svg')}" rel="icon" type="image/svg">
      <script>
        const objectData = {};
        objectData.langCode = "${langCode}";
        objectData.baseUrl = "${baseUrl}/${langCode}";
        objectData.imageBaseUrl = ${imageBaseUrl};
        objectData.env = "${this.getENV()}";
        objectData.translations = ${translationsClient};
        objectData.asseturl = "${this.url('/assets')}";
        objectData.inventoryNumber = "${id}";
      </script>
    </head>
    <body>
      <div id="page">
        ${navigation}
        ${masterData}
        <section id="reprints" class="leporello-reprints js-main-content">
          <h2 class="leporello-reprints__headline">${this.translate('impressions', langCode)}</h2>
          ${reprintsLevel1}
          ${reprintsLevel2}
          ${reprintsLevel3}
          ${reprintsLevel4}
          ${reprintsLevel5}
        </section>
          <section class="final-words">
          <div class="foldable-block text-block">
            ${citeCda}
          </div>
          <div class="text-block">
            ${improveCdaSnippet}
          </div>
        </section>
          <footer class="main-footer">
          ${copyright}
        </footer>

      </div>
      <script src="${this.url('/assets/scripts/main.js')}"></script>
      <script src="${cranachCollectBaseUrl}/${cranachCollectScript}"></script>
    </body>
  </html>`;
};
