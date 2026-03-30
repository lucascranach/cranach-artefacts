let langCode;
let config;

const metaDataHeader = require('./components/meta-data-head.11ty');
const improveCda = require('./components/improve-cda.11ty');
// const pageDateSnippet = require('./components/page-date.11ty');
const copyrightSnippet = require('./components/copyright.11ty');
const citeCdaSnippet = require('./components/cite-cda.11ty');
const masterDataSnippet = require('./components/graphic-virtual-object-master-data.11ty');
const graphicsRealObject = require('./components/graphic-real-object.11ty');
const navigationSnippet = require('./components/navigation.11ty');

const getimageBaseUrl = () => JSON.stringify(config.imageTiles);
const getClientTranslations = () => JSON.stringify(this.getClientTranslations());
const getLangCode = ({ content }) => content.metadata.langCode;
const getDocumentTitle = ({ content }) => content.metadata.title;

const editionMap = {
  '': 'a)',
  '0': 'a)',
  '1': 'b)',
  '2': 'c)',
  '3': 'd)',
  '4': 'e)',
  '5': 'f)',
  '6': 'g)',
  '7': 'h)',
  '8': 'i)',
  '9': 'j)',
  '10': 'k)',
  '11': 'l)',
  '12': 'm)',
  '13': 'n)',
  '14': 'o)',
  '15': 'p)',
  '16': 'q)',
  '17': 'r)',
  '18': 's)',
  '19': 't)',
  '20': 'u)',
  '21': 'v)',
  '22': 'w)',
  '23': 'x)',
  '24': 'y)',
  '25': 'z)',
  '26': 'unklar',
  '100': 'a?)',
  '101': 'b?)',
  '102': 'c?)',
  '103': 'd?)',
  '104': 'e?)',
  '105': 'f?)',
  '106': 'g?)',
  '107': 'h?)',
  '108': 'i?)',
  '109': 'j?)',
  '110': 'k?)',
  '111': 'l?)',
  '112': 'm?)',
  '113': 'n?)',
  '114': 'o?)',
  '115': 'p?)',
  '116': 'q?)',
  '117': 'r?)',
  '118': 's?)',
  '119': 't?)',
  '120': 'u?)',
  '121': 'v?)',
  '122': 'w?)',
  '123': 'x?)',
  '124': 'y?)',
  '125': 'z?)'
};

const generateReprint = (eleventy, id, masterData, collections) => {
  const data = {
    content: eleventy.getReprintData(id, langCode),
  };
  const path = `${config.dist}/${langCode}/${id}`;
  const filename = 'index.html';

  const baseUrl = eleventy.getBaseUrl();
  data.content.url = `${baseUrl}/${langCode}/${id}`;

  data.content.currentCollection = langCode === 'en'
    ? collections.graphicsRealObjectsEN
    : collections.graphicsRealObjectsDE;

  const reprint = graphicsRealObject.getRealObject(eleventy, data, langCode, masterData);
  eleventy.writeDocument(path, filename, reprint);
};

const getReprints = (eleventy, data, conditionLevel, secondConditionLevel = false) => {
  const { content } = data;
  const { collections } = data;

  if (!content.references.reprints) return '';

  const reprintsListData = [...content.references.reprints];
  const reprintsListRefData = reprintsListData.map((item) => eleventy.getReprintRefItem(item.inventoryNumber, langCode));
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

  // condition = zustand, edition = auflage
  const editionsInCondition = [...(new Set(reprints.map((reprint) => reprint.editionNumber)))];
  const editionDescriptions = content.dating.historicEventInformations.filter(((event) => event.eventType === 'EDITION'));

  // Custom sort: A, A?, B, B?, C, C?, ... Z, Z?, unklar
  const getSortKey = (editionNumber) => {
    const num = parseInt(editionNumber, 10);
    if (num === 26) return 9999; // "unklar" kommt ganz zum Schluss
    if (num >= 100) return (num - 100) * 10 + 1; // A? (100) = 1, B? (101) = 11, etc.
    return num * 10; // A (0) = 0, B (1) = 10, etc.
  };

  const editionsList = editionsInCondition.sort((a, b) => getSortKey(a) - getSortKey(b)).map((editionNumber) => {
    const edition = editionDescriptions.find((event) => event.editionNumber === editionNumber);
    const description = edition ? edition.remarks : '';
    const reprintsList = reprints.filter((reprint) => reprint.editionNumber === editionNumber);
    const reprintsListHtml = reprintsList.map(
      (item) => {
        generateReprint(eleventy, item.id, masterData, collections);
        const url = `${baseUrl}/${langCode}/${item.id}/`;
        const title = eleventy.altText(item.title);
        const editionId = item.editionNumber ? editionMap[item.editionNumber] : '';
        const editionTitle = item.editionNumber ? ` (${editionId})` : '';
        // const editionVisibleID = item.editionNumber ? ` ${editionTitle}` : '';
        const cardText = [];
        if (item.date) cardText.push(item.date);
        if (item.repository) cardText.push(item.repository);

        return `
          <figure class="artefact-card" title="${item.id}">
            <a href="${url}" class="js-go-to-reprint">
              <div class="artefact-card__image-holder">
                <img src="${item.imgSrc}" alt="${title}" loading="lazy">
              </div>
              <figcaption class="artefact-card__content">
                <p class="artefact-card__text">${item.id}<br>${cardText.join(', ', cardText)}</p>
              </figcaption>
            </a>
          </figure>
        `;
      },
    );

    const editionTitle = `${this.translate('edition', langCode)} ${editionMap[editionNumber.toString()]}`;
    const editionDate = edition ? edition.text : '';

    return `
      <details style="">
        <summary>${editionTitle} ${editionDate}</summary>
        <p>${description}</p>
      </details>
      <div class="reprints-gallery">
        ${reprintsListHtml.join('')}
      </div>
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
  // const pageDate = pageDateSnippet.getPageDate(this, langCode);
  const reprintsLevel0 = getReprints(this, data, 0);
  const reprintsLevel1 = getReprints(this, data, 1);
  const reprintsLevel2 = getReprints(this, data, 2);
  const reprintsLevel3 = getReprints(this, data, 3);
  const reprintsLevel4 = getReprints(this, data, 4);
  const reprintsLevel5 = getReprints(this, data, 5);
  const reprintsLevel100 = getReprints(this, data, 100);
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
          ${reprintsLevel0} <!-- Unbekannter Zustand -->
          ${reprintsLevel1} <!-- Zustand 1 -->
          ${reprintsLevel2} <!-- Zustand 2 -->
          ${reprintsLevel3} <!-- Zustand 3 -->
          ${reprintsLevel4} <!-- Zustand 4 -->
          ${reprintsLevel5} <!-- Zustand 5 -->
          ${reprintsLevel100} <!-- Einiziger Zustand -->
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
