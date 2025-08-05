let langCode;
let config;

const metaDataHeader = require('./components/meta-data-head.11ty');
const improveCda = require('./components/improve-cda.11ty');
const pageDateSnippet = require('./components/page-date.11ty');
const copyrightSnippet = require('./components/copyright.11ty');
const titleSnippet = require('./components/title.11ty');
const navigationSnippet = require('./components/navigation.11ty');

const getLangCode = ({ content }) => content.metadata.langCode;
const getDocumentTitle = ({ content }) => content.title.replace(/<(.*?)>/g, ''); 

const getHeader = (data) => {
  const title = titleSnippet.getTitle(this, data, langCode);
  const subtitle = data.content.publications[0] ? data.content.publications[0].text : '';
  return `
  <header class="artefact-header">
    ${title}
    <h2 class="subtitle has-tight-separator">${subtitle}</h2>
  </header>`;
};

const getliteratureArtefactItems = (data, langCode, baseUrl) => {
  const litItems = data.content.connectedObjects;
  if(!litItems) return '';

  const sortedItems = litItems.sort((a, b) => {
    if (a.pageNumber < b.pageNumber) {
      return -1;
    }
    if (a.pageNumber > b.pageNumber) {
      return 1;
    }
    return 0;
  });

  const itemList = sortedItems.map((item) => {
    
    const {inventoryNumber} = item;
    const itemData = this.getPainting(inventoryNumber, langCode);
    if(!itemData) return '';

    const itemObjectLink = `${baseUrl}/${langCode}/${itemData.metadata.id}/`;
    const referenceOnPage =  item.pageNumber ? item.pageNumber : '';
    const catalogueNumber =  item.catalogNumber ? item.catalogNumber : '';
    const figureNumber =  item.figureNumber ? item.figureNumber : '';

    return `
    <tr class="related-item-row">
      <td class="related-item-image-field">
        <a href="${itemObjectLink}">
          <figure class="related-item">
            <div class="related-item__image-holder">
              <img loading="lazy" src="${this.url(itemData.metadata.imgSrc)}" alt="${itemData.metadata.title}">
            </div>
          </figure>
        </a>
      </td>
      <td class="related-item__title">${itemData.metadata.title}</td>
      <td class="related-item__text">${itemData.repository}</td>
      <td>${referenceOnPage}</td>
      <td>${catalogueNumber}</td>
      <td>${figureNumber}</td>
    </tr>
    `;
  });
  return `<table class="items-table sortable">
    <thead>
      <tr>
        <th></th>
        <th>${this.translate('title', langCode)}</th>
        <th>${this.translate('repository', langCode)}</th>
        <th class="dir-u">${this.translate('referenceOnPage', langCode)}</th>
        <th>${this.translate('catalogueNumber', langCode)}</th>
        <th>${this.translate('figurePlate', langCode)}</th>
      </tr>
    </thead>
    <tbody>
      ${itemList.join('')}
    </tbody>
    </table>`;
};

const getLiteratureDetails = (content, langCode, cranachSearchURL, documentTitle) => {

  const getAuthors = (content, searchUrl) => {
    const searchUrlIntern = searchUrl.replace(/de\/search/, 'de/intern/search');
    const { persons } = content; 
    if(persons.length === 0) return '';

    const personsWithoutOfficin = persons.filter((person) => person.role !== 'OFFICIN');

    const authorsList = personsWithoutOfficin.map((person) => {
      return `<a class="has-interaction is-stupid-link" href="${searchUrlIntern}?kind=literature_references&search_term=${person.name.replace(/ /g, "+")}">${person.name}</a>`;
    });

    return authorsList.join(', ');
  };

  const getOfficins = (content, searchUrl) => {
    const searchUrlIntern = searchUrl.replace(/de\/search/, 'de/intern/search');
    const { persons } = content; 
    if(persons.length === 0) return '';

    const officins = persons.filter((person) => person.role === 'OFFICIN');

    const officinsList = officins.map((person) => {
      return `<a class="has-interaction is-stupid-link" href="${searchUrlIntern}?kind=literature_references&search_term=${person.name.replace(/ /g, "+")}">${person.name}</a>`;
    });

    return officinsList;
  };

  const getEntry = (rowContent, translationID) => {
    if(!rowContent) return '';
    const content = rowContent.match(/^http/) ? `<a href="${rowContent}" class="has-interaction is-link">${rowContent}</a>` : this.stripTags(rowContent);
    return `<dt class="definition-list__term">${this.translate(translationID, langCode)}</dt><dd class="definition-list__definition">${content}</dd>`;
  }

  const alternateNumbers = (!content || !content.alternateNumbers) ? []
    : content.alternateNumbers.map((alternateNumber) => `${alternateNumber.description} ${alternateNumber.number}`);

  const authors = getAuthors(content, cranachSearchURL);
  const officins = getOfficins(content, cranachSearchURL);
  const officinBlock = (officins.length > 0 )
    ? `<dt class="definition-list__term">${this.translate('officin', langCode)}</dt><dd class="definition-list__definition">${officins.join('')}</dd>`
    : '';

  return `
    <dl class="definition-list is-grid is-loose">
      <dt class="definition-list__term">${this.translate('kuerzel', langCode)}</dt>
      <dd class="definition-list__definition">${content.shortTitle}</dd>
      <dt class="definition-list__term">${this.translate('author', langCode)}, ${this.translate('publisher', langCode)}</dt>
      <dd class="definition-list__definition">${authors}</dd>
      ${officinBlock}
      <dt class="definition-list__term">${this.translate('title', langCode)}</dt>
      <dd class="definition-list__definition">${documentTitle}</dd>
      ${content.subtitle ? getEntry(content.subtitle, 'publication') : ''}
      ${content.pages ? getEntry(content.pages, 'pages') : ''}
      ${content.series ? getEntry(content.series, 'series') : ''}
      ${content.volume ? getEntry(content.volume, 'volume') : ''}
      ${content.journal ? getEntry(content.journal, 'journal') : ''}
      ${content.issue ? getEntry(content.issue, 'issue') : ''}
      ${content.publication ? getEntry(content.publication, 'publication') : ''}
      ${content.publishLocation ? getEntry(content.publishLocation, 'publishLocation') : ''}
      ${content.edition ? getEntry(content.edition, 'publishEdition') : ''}
      ${content.publishDate ? getEntry(content.publishDate, 'publishDate') : ''}
      ${content.periodOfOrigin ? getEntry(content.periodOfOrigin, 'periodOfOrigin') : ''}
      ${content.physicalDescription ? getEntry(content.physicalDescription, 'physicalDescription') : ''}
      ${content.mention ? getEntry(content.mention, 'mention') : ''}
      ${content.link ? getEntry(content.link, 'permalink') : ''}
      ${content.copyright ? getEntry(content.copyright, 'link') : ''}
      ${content.pageNumbers ? getEntry(content.pageNumbers, 'pages') : ''}
      ${getEntry(alternateNumbers.join(', '), 'alternativeNumbers')}
    </dl>
  `;
};

// eslint-disable-next-line func-names
exports.render = function (pageData) {
  const data = pageData;
  langCode = getLangCode(data);
  config = this.getConfig();
  const baseUrl = this.getBaseUrl();
  const cranachSearchURL = config.cranachSearchURL[process.env.ELEVENTY_ENV].replace(/langCode/, langCode);

  data.content.currentCollection = data.collections[data.collectionID];
  data.content.entityType = data.entityType;
  data.content.url = `${this.getBaseUrl()}${data.page.url}`;

  this.log(data);

  const { id } = data.content.metadata;
  const documentTitle = getDocumentTitle(data);
  const header = getHeader(data);

  data.content.description = `${data.content.textCategory}, ${data.content.shortTitle}, ${data.content.authors}`;
  const metaDataHead = metaDataHeader.getHeader(data);
  const literatureArtefactItems = getliteratureArtefactItems(data, langCode, baseUrl);

  const literatureDetails = getLiteratureDetails(data.content, langCode, cranachSearchURL, documentTitle);
  
  // const citeCda = citeCdaSnippet.getCiteCDA(this, data, langCode);
  const improveCdaSnippet = improveCda.getImproveCDA(this, data, config, langCode);
  const copyright = copyrightSnippet.getCopyright();
  const pageDate = pageDateSnippet.getPageDate(this, langCode);
  const navigation = navigationSnippet.getNavigation(this, langCode, id, 'literature');

  const cranachCollectBaseUrl = this.getCranachCollectBaseUrl();
  const cranachCollectScript = config.cranachCollect.script;

  return `<!doctype html> 
  <html lang="${langCode}">
    <head>
      <title>cda :: ${this.translate('literatureDocuments', langCode)} :: ${documentTitle}</title>
      ${metaDataHead}
      <link href="${this.url('/compiled-assets/main.css')}" rel="stylesheet">
      <link href="${this.url('/assets/images/favicon.svg')}" rel="icon" type="image/svg">
      
      <script>
        const objectData = {};
        objectData.langCode = "${langCode}";
        objectData.imageStack = false;
        objectData.baseUrl = "${baseUrl}/${langCode}";
        objectData.imageBaseUrl = false;
        objectData.env = "${this.getENV()}";
        objectData.translations = false;
        objectData.asseturl = "${this.url('/assets')}";
        objectData.inventoryNumber = "${id}";
        objectData.navigationObjects = false;
      </script>

    </head>
    <body>
      <div id="page">
      ${navigation}
        <section class="literature-page js-main-content">
          <div class="grid-wrapper">
            ${header}
          </div>
          <div class="grid-wrapper">
            <div class="main-column">
              ${literatureDetails}
            </div>
            <div class="marginal-content">
              <h3>${this.translate('worksDiscussedInPublication', langCode)}</h3>

              <div class="responsive-table-wrap">
                ${literatureArtefactItems}
              </div>
            </div>
          </div>
        </section>

        <section class="final-words">
          <div class="foldable-block text-block">
            
          </div>
          <div class="text-block">
            ${improveCdaSnippet}
          </div>
        </section>
          <footer class="main-footer">
          ${copyright}
          ${pageDate}
        </footer>

      </div>
      <script src="${this.url('/assets/scripts/openseadragon.min.js')}"></script>
      <script src="${this.url('/assets/scripts/main.js')}"></script>
      <script src="${cranachCollectBaseUrl}/${cranachCollectScript}"></script>
      <script src="${this.url('/assets/scripts/sortable.min.js')}"></script>
    </body>
  </html>`;
};
