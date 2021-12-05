let langCode;
let config;

const metaDataHeader = require("./components/meta-data-head.11ty");
const improveCda = require("./components/improve-cda.11ty");

const getLangCode = ({ content }) => content.metadata.langCode;


const getPageDate = () => {
  const currentDay= new Date().getDate();
  const currentMonth = new Date().getMonth() +1;
  const currentYear = new Date().getFullYear();
  return `<p class="date">${this.translate('pageGenerated', langCode)} ${currentDay}.${currentMonth}.${currentYear}</p>`;
}

const getCopyright = () => {
  const currentYear = new Date().getFullYear();
  return `<p>© Stiftung Museum Kunstpalast, Düsseldorf / Technische Hochschule Köln, ${currentYear}</p>`;
};

const getCiteCDA = () => {
  const headline = this.translate('citeCdaHeadline', langCode);
  const citeWithAutor = this.translate('citeWithAutor', langCode);
  const citeWithAutorText = this.convertTagsInText(this.translate('citeWithAutorText', langCode));
  const citeWithoutAutor = this.translate('citeWithoutAutor', langCode);
  const citeWithoutAutorText = this.convertTagsInText(this.translate('citeWithoutAutorText', langCode));
  return `
    <h2>${headline}</h2>
      <dl class="definition-list is-stacked">
      <dt class="definition-list__term">${citeWithAutor}</dt>
      <dd class="definition-list__definition">${citeWithAutorText}</dd>
      <dt class="definition-list__term">${citeWithoutAutor}</dt>
      <dd class="definition-list__definition">${citeWithoutAutorText}</dd>
    </dl>
  `;
};



const getDocumentTitle = ({ content }) => content.metadata.title;

const getTitle = (content) => {
  const titleList = content.titles.map((item) => ({ text: item.title, remark: item.remarks }));

  const label = titleList.length > 1 ? this.translate('titles', langCode) : this.translate('title', langCode);
  const allTitles = this.getRemarkDataTable('Titles', titleList, 'mainTitle', label);
  return `
    <h1 id="mainTitle" class="title">${content.metadata.title}</h1>
    ${allTitles}
  `;
};

const getMedium = (content) => {
  const { medium } = content;
  const structuredMediumData = this.getStructuredDataFromString(medium);
  const visibleContent = structuredMediumData[0].text;
  const hasAdditionalContent = !!(structuredMediumData.length >= 1 && structuredMediumData[0].remark.match(/[a-z]/));
  const label = this.translate('medium', langCode);
  const mediumTable = hasAdditionalContent ? this.getRemarkDataTable('Medium', structuredMediumData, 'subtitle', label) : '';
  return !medium ? '' : `
    <div class="has-tight-separator">
      <div id="subtitle">
        <p class="subtitle">${visibleContent}</p>
      </div>
      ${mediumTable}
    </div>
  `;
};

const getImage = ({ content }) => {
  const src = content.metadata.imgSrc;
  const alt = content.metadata.title;
  return `
    <figure class="leporello-recog__image">
      <img loading="lazy" src="${src}" alt="${this.altText(alt)}">
    </figure>
  `;
};

const getHeader = ({ content }) => {
  const title = getTitle(content);
  const subtitle = getMedium(content);
  return `
  <header class="artefact-header">
    ${title}
    ${subtitle}
  </header>`;
};

const getAttribution = ({ content }) => {
  const numberOfItems = 2;
  const getAttributer = (item) => {
    const fragments = [];
    if (item.prefix) fragments.push(item.prefix);
    if (item.name) fragments.push(item.name);
    if (item.suffix) fragments.push(item.suffix);
    return fragments.join(' ');
  };
  const attributionShortListItems = content.involvedPersons.slice(0, numberOfItems);
  const attributionShortList = attributionShortListItems.map((item) => getAttributer(item));
  const attributionFullList = content.involvedPersons.map((item) => ({ text: `${getAttributer(item)}`, remark: item.remarks }));
  const label = content.involvedPersons.length > 1 ? this.translate('attributions', langCode) : this.translate('attribution', langCode);
  const allAttributions = this.getRemarkDataTable('Attributions', attributionFullList, 'attributionData', label);

  return content.involvedPersons.length === 0 ? '' : `
    <dl id="attributionData" class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">
        ${attributionShortList.join('<br>')}
      </dd>
    </dl>
    ${allAttributions}
  `;
};

const getDating = ({ content }) => {
  const numberOfItems = 2;
  const combinedDates = [
    { text: content.dating.dated, remarks: content.dating.remarks },
    ...content.dating.historicEventInformations,
  ];
  const datesShortListItems = combinedDates.slice(0, numberOfItems);
  const datesShortList = datesShortListItems.map((item) => item.text);
  const datesFullList = combinedDates.map((item) => ({ text: `${item.text}`, remark: item.remarks }));
  const label = datesFullList.length > 1 ? this.translate('productionDates', langCode) : this.translate('productionDate', langCode);
  const allDates = this.getRemarkDataTable('Dates', datesFullList, 'dataList', label);

  return datesShortListItems.length === 0 ? '' : `
    <dl id="dataList" class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">${datesShortList.join('<br>')}</dd>
    </dl>

    ${allDates}
  `;
};

const getSignature = ({ content }) => {
  const signatureItems = content.signature.split(/\]\n\n/).map((item) => {
    const separator = item.match(/\n\n/) ? '\n\n' : '\n';
    const elements = item.split(separator);
    return { text: elements.shift(), remark: elements.join('\n') };
  });
  const label = this.translate('signature', langCode);
  const signatureTable = signatureItems[0].text.match(/^keine$|none$/i) ? '' : this.getRemarkDataTable('Signature', signatureItems, 'signature', label);
  return !content.signature ? '' : `
    <dl id="signature" class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">${signatureItems[0].text}</dd>
    </dl>
    ${signatureTable}
  `;
};

const getInscriptionsOld = ({ content }) => {
  const inscriptionsHeadline = `<span class="term">${this.translate('inscriptionsInnerHeadline', langCode)}</span>`;
  const inscriptions = content.inscription ? `${inscriptionsHeadline}${content.inscription}` : false;
  const stampsHeadline = `<span class="term">${this.translate('stampsInnerHeadline', langCode)}</span>`;
  const stamps = content.markings ? `${stampsHeadline}${content.markings}` : false;
  let inscriptionsRaw = `${content.inscription}${content.markings}`.replace(/:\n/, ': ');
  inscriptionsRaw = inscriptionsRaw.replace(/\n *?\n/sg, '\n\n');

  const inscriptionItems = inscriptionsRaw.split(/\]\n\n/).map((item) => {
    const separator = item.match(/\n\n/) ? '\n\n' : '\n';
    const elements = item.split(separator);
    return { text: elements.shift(), remark: elements.join('\n') };
  });

  const numberOfWords = 20;
  const fullText = inscriptionItems[0].text;
  const words = fullText.split(/ /);
  const preview = words.length > numberOfWords ? `${words.slice(0, numberOfWords).join(' ')} …` : fullText;
  const label = this.translate('inscriptions', langCode);
  const inscriptionTable = inscriptionItems[0].text.match(/^keine$/i) ? ''
    : this.getRemarkDataTable('Inscriptions', inscriptionItems, 'inscriptions', label);
  return !inscriptionsRaw ? '' : `
    <dl id="inscriptions" class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">${preview}</dd>
    </dl>
    ${inscriptionTable}
  `;
};

const getInscriptions = ({ content }) => {
  let inscriptionsRaw = `${content.inscription}`.replace(/:\n/, ': ');
  inscriptionsRaw = inscriptionsRaw.replace(/\n *?\n/sg, '\n\n');

  const inscriptionItems = inscriptionsRaw.split(/\]\n\n/).map((item) => {
    const separator = item.match(/\n\n/) ? '\n\n' : '\n';
    const elements = item.split(separator);
    return { text: elements.shift(), remark: elements.join('\n') };
  });

  const numberOfWords = 20;
  const fullText = inscriptionItems[0].text;
  const words = fullText.split(/ /);
  const preview = words.length > numberOfWords ? `${words.slice(0, numberOfWords).join(' ')} …` : fullText;
  const label = this.translate('inscriptionsInnerHeadline', langCode);
  const inscriptionTable = inscriptionItems[0].text.match(/^keine$/i) ? ''
    : this.getRemarkDataTable('Inscriptions', inscriptionItems, 'inscriptions', label);
  return !inscriptionsRaw ? '' : `
    <dl id="inscriptions" class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">${preview}</dd>
    </dl>
    ${inscriptionTable}
  `;
};

const getStamps = ({ content }) => {
  let stampsRaw = `${content.markings}`.replace(/:\n/, ': ');
  stampsRaw = stampsRaw.replace(/\n *?\n/sg, '\n\n');

  const stampItems = stampsRaw.split(/\]\n\n/).map((item) => {
    const separator = item.match(/\n\n/) ? '\n\n' : '\n';
    const elements = item.split(separator);
    return { text: elements.shift(), remark: elements.join('\n') };
  });

  const numberOfWords = 20;
  const fullText = stampItems[0].text;
  const words = fullText.split(/ /);
  const preview = words.length > numberOfWords ? `${words.slice(0, numberOfWords).join(' ')} …` : fullText;
  const label = this.translate('stampsInnerHeadline', langCode);
  const stampTable = stampItems[0].text.match(/^keine$/i) ? ''
    : this.getRemarkDataTable('Stamps', stampItems, 'stamps', label);
  return !stampsRaw ? '' : `
    <dl id="stamps" class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">${preview}</dd>
    </dl>
    ${stampTable}
  `;
};

const getStructuredDimensions = (dimensions) => {
  const lines = dimensions.split(/\n/s);
  const dimensionData = [];
  let dimensionsPerEntry = [];
  let sourcesPerEntry = [];
  let mode = 'collectDimensions';
  const addToDimensions = (d, s) => {
    dimensionData.push({
      text: d.join('<br>'),
      remark: s.join('<br>'),
    });
    mode = 'collectDimensions';
    dimensionsPerEntry = [];
    sourcesPerEntry = [];
  };
  lines.forEach((line) => {
    if (!line.match(/[a-zA-Z]/)) return;
    if (line.match(/cm/)) {
      if (mode === 'collectSources') {
        addToDimensions(dimensionsPerEntry, sourcesPerEntry);
        mode = 'collectDimensions';
        dimensionsPerEntry = [];
        sourcesPerEntry = [];
      }
      dimensionsPerEntry.push(line);
    } else {
      mode = 'collectSources';
      sourcesPerEntry.push(line);
    }
  });
  addToDimensions(dimensionsPerEntry, sourcesPerEntry);
  return dimensionData;
};

const getDimensions = ({ content }) => {
  const structuredDimensions = getStructuredDimensions(content.dimensions);
  const visibleContent = structuredDimensions[0].text.replace(/Maße/, '');
  const hasAdditionalContent = !!(structuredDimensions.length >= 1 && structuredDimensions[0].remark.match(/[a-z]/));
  const label = this.translate('dimensions', langCode);
  const dimensionsTable = hasAdditionalContent ? this.getRemarkDataTable('Dimensions', structuredDimensions, 'dimensions', label) : '';

  return !content.dimensions ? '' : `
    <dl id="dimensions" class="definition-list is-grid">
      <dt class="definition-list__term">${label}</dt>
      <dd class="definition-list__definition">${visibleContent}</dd>
    </dl>
    ${dimensionsTable}
  `;
};


const getCopyText = ({ content }) => {
  const numberOfWords = 50;
  const fullText = content.description;
  const words = fullText.split(/ /);
  const preview = words.slice(0, numberOfWords).join(' ');
  const text = words.length > numberOfWords ? `
    <div id="switchableCopyText" data-js-switchable-content='["previewText","fullText"]'>
      <div id="previewText" class="preview-text">${this.getFormatedText(preview)}</div>
      <div class="is-cut full-text" id="fullText">${this.getFormatedText(fullText)}</div>
    </div>
    ` : `
      ${this.getFormatedText(fullText)}
    `;
  return !content.description ? '' : text;
};

const getLocation = ({ content }) => {
  
  const location = !content.locations[0].term
    ? ''
    : `
      <dt class="definition-list__term">${this.translate('location', langCode)}</dt>
      <dd class="definition-list__definition">${content.locations[0].term}</dd>
    `;
  return `
    <dl class="definition-list is-grid">
      <dt class="definition-list__term">${this.translate('owner', langCode)}</dt>
      <dd class="definition-list__definition">${content.owner}</dd>
      <dt class="definition-list__term">${this.translate('repository', langCode)}</dt>
      <dd class="definition-list__definition">${content.repository}</dd>
      ${location}

    </dl>
  `;
}

const getImageDescriptionObjectInfo = ({ content }) => {
  const date = content.metadata.date ? `, ${content.metadata.date}` : '';
  const attribution = !content.metadata.subtitle ? '' : `<li class="image-description-text has-small-separator">${content.metadata.subtitle}</li>`;
  return `
    <ul class="image-caption">
      <li class="image-caption__title">${content.metadata.title}${date}</li>
      ${attribution}
    </ul>
  `;
};

const getIds = ({ content }) => `
    <dl class="definition-list is-grid">
      <dt class="definition-list__term">CDA ID</dt>
      <dd class="definition-list__definition" data-clipable-content="${content.metadata.id}">${content.metadata.id}</dd>
      <dt class="definition-list__term">${this.translate('objectName', langCode)}</dt>
      <dd class="definition-list__definition" data-clipable-content="${content.objectName}">${content.objectName}</dd>
      <dt class="definition-list__term">${this.translate('permalink', langCode)}</dt>
      <dd class="definition-list__definition" data-clipable-content="${content.url}">${content.url}</dd>
    </dl>
  `;

const getExhibitions = ({ content }) => (!content.exhibitionHistory ? '' : `
    <div class="foldable-block has-strong-separator"> 
      <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="false" data-js-expandable="exhibition-history">
        ${this.translate('exhibitions', langCode)}</h2>
      <div class="expandable-content" id="exhibition-history">
      ${this.markdownify(content.exhibitionHistory)}
      </div>
    </div>`);

const getProvenance = ({ content }) => (!content.provenance ? '' : `
    <div class="foldable-block has-strong-separator">
      <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="false" data-js-expandable="provenance">
        ${this.translate('provenance', langCode)}</h2>
      <div class="expandable-content" id="provenance">
      ${this.markdownify(content.provenance)}
      </div>
    </div>
  `);

const getSources = ({ content }) => {
  const getLiteraturDetails = (item) => {
    const author = item && item.persons ? item.persons.filter((person) => person.role === 'AUTHOR').map((person) => person.name) : [];
    const publisher = item && item.persons
      ? item.persons.filter((person) => person.role === 'PUBLISHER' || person.role === 'UNKNOWN').map((person) => person.name) : [];
    const editing = item && item.persons ? item.persons.filter((person) => person.role === 'EDITORIAL_STAFF').map((person) => person.name) : [];
    const alternateNumbers = (!item || !item.alternateNumbers) ? [] : item.alternateNumbers.map((alternateNumber) => `
        ${alternateNumber.description}
        ${alternateNumber.number}
      `);

    const getRow = (rowContent, translationID) => (!rowContent ? ''
      : `<tr><th>${this.translate(translationID, langCode)}</th><td>${this.stripTags(rowContent)}</td></tr>`);

    return `
      <table class="literature-item-details-table">
        ${getRow(author.join(', '), 'author')}
        ${getRow(publisher.join(', '), 'publisher')}
        ${getRow(editing.join(', '), 'editing')}
        ${item && item.title ? getRow(item.title, 'title') : ''}
        ${item && item.subtitle ? getRow(item.subtitle, 'publication') : ''}
        ${item && item.pages ? getRow(item.pages, 'pages') : ''}
        ${item && item.series ? getRow(item.series, 'series') : ''}
        ${item && item.volume ? getRow(item.volume, 'volume') : ''}
        ${item && item.journal ? getRow(item.journal, 'journal') : ''}
        ${item && item.issue ? getRow(item.issue, 'issue') : ''}
        ${item && item.publication ? getRow(item.publication, 'publication') : ''}
        ${item && item.publishLocation ? getRow(item.publishLocation, 'publishLocation') : ''}
        ${item && item.publishDate ? getRow(item.publishDate, 'publishDate') : ''}
        ${item && item.periodOfOrigin ? getRow(item.periodOfOrigin, 'periodOfOrigin') : ''}
        ${item && item.physicalDescription ? getRow(item.physicalDescription, 'physicalDescription') : ''}
        ${item && item.mention ? getRow(item.mention, 'mention') : ''}
        ${item && item.link ? getRow(item.link, 'permalink') : ''}
        ${item && item.pageNumbers ? getRow(item.pageNumbers, 'pages') : ''}
        ${getRow(alternateNumbers.join(', '), 'alternativeNumbers')}
      </table>
    `;
  };

  const publicationListData = content.publications.map((item) => {
    const itemWithReferenceData = item;
    itemWithReferenceData.referenceData = this.getLitRef(item.referenceId, langCode);
    return itemWithReferenceData;
  });
  const publicationListDataByDate = publicationListData.sort((a, b) => {
    if (!a.referenceData) return 0;
    if (!b.referenceData) return 0;
    const dateA = a.referenceData.publishDate ? a.referenceData.publishDate : a.referenceData.date;
    const dateB = b.referenceData.publishDate ? b.referenceData.publishDate : b.referenceData.date;
    return dateB - dateA;
  });
  const publicationList = publicationListDataByDate.map(
    (item, index) => {
      const litRef = this.getLitRef(item.referenceId, langCode);
      const litRefTableData = this.getLitRefTableData(item.referenceData, content.metadata.id);
      const hasBackground = index % 2 ? 'has-bg' : '';
      return `
        <tr
          class="row ${hasBackground} is-head" 
          id="litRef${item.referenceId}-${index}">

          <td class="cell has-interaction"><a href="#" data-js-toggle-literature="${item.referenceId}-${index}">${item.title}</a></td>
          <td class="cell">${item.pageNumber} </td>
          <td class="cell">${litRefTableData.catalogNumber}</td>
          <td class="cell">${litRefTableData.figureNumber}</td>
        </tr>
        <tr class="row ${hasBackground} is-detail" id="litRefData${item.referenceId}-${index}">
          <td class="cell" colspan="4">
            ${getLiteraturDetails(litRef)}
          </td>
        </tr>
        `;
    },
  );

  const publications = content.publications ? `
    <div class="foldable-block has-strong-separator"> 
      <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="false" data-js-expandable="literature-list">
        ${this.translate('literature', langCode)}</h2>
      <div id="literature-list" class="expandable-content">
        <table class="table literature">
          <thead class="head">
            <tr class="row">
              <td class="cell" style="width: 40%"></td>
              <td class="cell" style="width: 20%">${this.translate('referenceOnPage', langCode)}</td>
              <td class="cell" style="width: 20%">${this.translate('catalogueNumber', langCode)}</td>
              <td class="cell" style="width: 20%">${this.translate('plate', langCode)}</td>
            </tr>
          </thead>
          <tbody class="body">
          ${publicationList.join('\n')}
          </tbody>
        </table>
      </div>
    </div>` : '';

  return content.publications.length === 0 ? '' : publications;
};

const getImageStack = ({ content }) => JSON.stringify(content.images);

const getImageBasePath = () => JSON.stringify(config.imageTiles);

const getClientTranslations = () => JSON.stringify(this.getClientTranslations());

const getNavigation = () => {
  const cranachSearchURL = `${config.cranachSearchURL}/${langCode}`;

  return `
    <nav class="main-navigation js-navigation">
      <a class="logo js-home" href="${cranachSearchURL}">cda_</a>
      <a class="back icon has-interaction js-back">arrow_back</a>
    </nav>
  `;
}

const getImageStripe = ({ content }) => {
  const imageStack = content.images;
  const { contentTypes } = config;

  const imageStripe = Object.keys(contentTypes).map((key) => {
    if (!imageStack || !imageStack[key]) return;

    const { images } = imageStack[key];
    const html = images.map((image) => {
      const title = image.metadata && image.metadata[langCode] ? this.altText(image.metadata[langCode].description) : `${key}`;
      return `
        <li
          class="image-stripe-list__item has-interaction"
          data-image-type="${key}" 
          data-image-id="${image.id}"
          data-js-change-image='{"key":"${key}","id":"${image.id}"}'>
          <img loading="lazy" src="${image.sizes.xsmall.src}" alt="${title}">
        </li>
      `;
    });
    return (html.join(''));
  });

  const availablecontentTypes = Object.keys(contentTypes).map((key) => {
    if (!imageStack || !imageStack[key]) return;
    const numberOfImages = imageStack[key].images.length;
    const type = (numberOfImages === 0) ? '' : `<option value="${key}">${this.translate(key, langCode)} (${numberOfImages})</option>`;
    return type;
  });

  const imageTypeselector = `
    <div class="imagetype-selector">
      <select size="1" data-js-image-selector="true">
        <option value="all">${this.translate('all', langCode)}</option>
        ${availablecontentTypes.join('')}
      </select>
    </div>
  `;

  return `
    <div class="foldable-block">
      <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="true" data-js-expandable="image-stripe">
        ${this.translate('illustrations', langCode)}</h2>
      <div id="image-stripe" class="expandable-content image-stripe">
        ${imageTypeselector}
        <ul class="image-stripe-list">
          ${imageStripe.join('')}
        </ul>
      </div>
    </div>
  `;
};

const ART_TECH_EXAMINATION = 'ArtTechExamination';
const CONDITION_REPORT = 'ConditionReport';
const CONSERVATION_REPORT = 'ConservationReport';

const getReports = ({ content }, type) => {
  const { contentTypes } = config;
  const documentsPath = `${config.documentsBasePath}/${content.inventoryNumber}_${content.objectName}`;
  const reports = content.restorationSurveys.filter((rs) => rs.type === type);
  const getReportImage = (itemId, itemType) => {
    if (!content.images || !content.images[itemType]) return false;
    // eslint-disable-next-line max-len
    const reportImage = content.images[itemType].images.filter((image) => image.id === itemId).shift();
    if (!reportImage) return false;
    return reportImage;
  };
  const reportList = reports.reverse().map((report, index) => {
    const imageItems = [];
    const otherItems = [];
    report.fileReferences.forEach((file) => {
      const { id } = file;
      // eslint-disable-next-line no-shadow
      const { type } = file;
      const image = getReportImage(id, type);
      if (image) imageItems.push({ type, id, image });
      else otherItems.push({ type, id });
    });
    const imageStripeItems = imageItems.map((item) => `
      <li
        class="image-stripe-list__item has-interaction"
        data-image-type="${item.type}" 
        data-image-id="${item.id}"
        data-js-change-image='{"key":"${item.type}","id":"${item.id}"}'>
        <img loading="lazy" src="${item.image.sizes.xsmall.src}" alt="${item.type}">
      </li>
      `);
    const documentStripeItems = otherItems.map((item) => {
      const typeData = contentTypes[item.type];
      return !typeData ? '' : `
      <li>
        <a href="${documentsPath}/${typeData.sort}_${typeData.fragment}/${item.id}.pdf" data-filetype="pdf"></a>
      </li>
      `;
    });
    const imageStripeReport = imageStripeItems.length > 0 ? `<ul class="image-stripe-list">${imageStripeItems.join('')}</ul>` : '';
    const documentStripeReport = documentStripeItems.length > 0 ? `<ul class="document-stripe-list">${documentStripeItems.join('')}</ul>` : '';
    const involvedPersonList = report.involvedPersons.map((person) => `<li>${person.role} ${person.name}</li>`);
    const involvedPersons = involvedPersonList.length === 0 ? '' : `
      <ul class="survey-persons">
        ${involvedPersonList.join('')}
      </ul>`;
    const firstItem = report.tests && report.tests.length > 0 ? report.tests[0] : false;
    const surveyTitle = firstItem.purpose;
    const surveyKeywordList = !firstItem ? [] : firstItem.keywords.map((keyword) => `<li>${keyword.name}</li>`);
    const surveyKeywords = surveyKeywordList.length > 0 ? `<ul class="survey-keywords">${surveyKeywordList.join('')}</ul>` : '';

    const surveyContent = report.tests.sort((a, b) => a.order - b.order).map((test) => {
      const text = this.getFormatedText(test.text.replace(/\n/g, '\n\n'), 'no-lists');
      const surveyKind = test.kind ? `<h4 class="survey-kind">${test.kind}</h4>` : '';
      return `
        ${surveyKind}
        ${text}
      `;
    });

    const project = report.project ? this.markdownify(report.project.replace(/\n/g, '\n\n')) : '';
    const overallAnalysis = report.overallAnalysis ? this.markdownify(report.overallAnalysis.replace(/\n/g, '\n\n')) : '';
    const remarks = report.remarks ? this.markdownify(report.remarks.replace(/\n/g, '\n\n')) : '';
    const getDate = () => {
      const { processingDates } = report;
      return processingDates.beginDate !== processingDates.endDate
        ? `${processingDates.beginDate} - ${processingDates.endDate}` : processingDates.beginDate;
    };
    const date = report.processingDates ? getDate() : false;
    const surveySlug = this.slugify(`${surveyTitle}-${index}-${type}`);
    const getSurveyTitle = () => {
      if (surveyTitle && date) return `<h3 class="survey-title"><span class="is-identifier">${date}</span>${surveyTitle}</h3>`;
      if (date) return `<h3 class="survey-title"><span class="is-identifier">${this.translate('date', langCode)}</span>${date}</h3>`;
      return '';
    };
    const title = getSurveyTitle();

    return `
    <div class="survey foldable-block has-separator">
      <header class="survey-header is-expand-trigger" data-js-expanded="false" data-js-expandable="${surveySlug}">
        ${title}
        ${surveyKeywords}
        ${documentStripeReport}
        ${imageStripeReport}
      </header>

      <div class="survey-content expandable-content" id="${surveySlug}">
        ${surveyContent.join('')}
        ${project}
        ${overallAnalysis}
        ${remarks}
        ${involvedPersons}
      </div>
    </div>
    `;
  });

  return (reports && reports.length > 0)
    ? `
    <div class="foldable-block has-strong-separator">
      <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="false" data-js-expandable="report-${type}">
        ${this.translate(type, langCode)}</h2>
      <div id="report-${type}" class="expandable-content">
        ${reportList.join('')}
      </div>
    </div>
    ` : '';
};

const getAdditionalTextInformation = ({ content }) => {
  const additionalInfos = content.additionalTextInformation;
  const additionalInfoTypes = additionalInfos.map((item) => item.type);
  // eslint-disable-next-line max-len
  const uniqueAdditionalInfoTypes = additionalInfoTypes.filter((item, index) => additionalInfoTypes.indexOf(item) === index);
  const getTypeContent = (type) => {
    const typeContent = additionalInfos.filter((item) => item.type === type);
    return typeContent.length === 0 ? '' : typeContent.map((item) => {
      const formatedText = this.getFormatedText(item.text);
      return `
        <div class="block has-padding">
          ${formatedText}
        </div>
      `;
    });
  };
  return uniqueAdditionalInfoTypes.length === 0 ? '' : uniqueAdditionalInfoTypes.map((type) => `
    <div class="foldable-block has-strong-separator">
        <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="false" data-js-expandable="${this.slugify(type)}">${type}</h2>
        <div class="expandable-content" id="${this.slugify(type)}">
          ${getTypeContent(type).join('')}
        </div>
      </div>
    `);
};

const RELATED_IN_CONTENT_TO = 'RELATED_IN_CONTENT_TO';
const SIMILAR_TO = 'SIMILAR_TO';
const BELONGS_TO = 'BELONGS_TO';
const GRAPHIC = 'GRAPHIC';
const PART_OF_WORK = 'PART_OF_WORK';

const getReference = ({ content }, type, isOpen = false) => {
  const references = content.references.concat(content.secondaryReferences);
  const getTypeContent = (refType) => {
    const typeContentItems = references.filter((item) => item.kind === refType);
    const typeContentItemList = typeContentItems.map((item) => {
      const refObjectMeta = this.getRefObjectMeta(content.currentCollection, item.inventoryNumber);
      const refObjectLink = `/${langCode}/${content.entityType}/${refObjectMeta.id}/`;
      return `
        <div class="related-item-wrap">
          <a href="${refObjectLink}">
          <figure class="related-item">
            <div class="related-item__image">
              <img loading="lazy" src="${refObjectMeta.imgSrc}" alt="${this.altText(refObjectMeta.title)}">
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
        <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="${state}" data-js-expandable="${this.slugify(type)}">
          ${this.translate(type, langCode)}</h2>
        <div class="expandable-content" id="${this.slugify(type)}">
        ${typeContentItemList.join('')}
        </div>
      </div>
    `;
  };

  return getTypeContent(type);
};

// eslint-disable-next-line func-names
exports.render = function (pageData) {
  const data = pageData;
  langCode = getLangCode(data);
  config = this.getConfig();

  data.content.currentCollection = data.collections[data.collectionID];
  data.content.entityType = data.entityType;
  data.content.url = `${this.getBaseUrl()}${data.page.url}`;

  this.log(data);
  const documentTitle = getDocumentTitle(data);
  const header = getHeader(data);
  const image = getImage(data);
  const copy = getCopyText(data);
  const dating = getDating(data);
  const dimensions = getDimensions(data);
  const attribution = getAttribution(data);
  const location = getLocation(data);
  const signature = getSignature(data);
  const inscription = getInscriptions(data);
  const stamps = getStamps(data);
  const ids = getIds(data);
  const exhibitions = getExhibitions(data);
  const provenance = getProvenance(data);
  const sources = getSources(data);
  const imageStack = getImageStack(data);
  const imageBasePath = getImageBasePath(data);
  const translationsClient = getClientTranslations(data);
  const imageStripe = getImageStripe(data);
  const artTechExaminations = getReports(data, ART_TECH_EXAMINATION);
  const conditionReport = getReports(data, CONDITION_REPORT);
  const conservationReport = getReports(data, CONSERVATION_REPORT);
  const additionalTextInformation = getAdditionalTextInformation(data);
  const relatedInContentTo = ""; // getReference(data, RELATED_IN_CONTENT_TO);
  const similarTo = ""; // getReference(data, SIMILAR_TO);
  const belongsTo = ""; // getReference(data, BELONGS_TO);
  const graphic = ""; // getReference(data, GRAPHIC);
  const partOfWork = ""; // getReference(data, PART_OF_WORK, true);
  const imageDescriptionObjectInfo = getImageDescriptionObjectInfo(data);
  const citeCda = getCiteCDA(data);
  const improveCdaSnippet = improveCda.getImproveCDA(this, data, config, langCode);
  const copyright = getCopyright();
  const pageDate = getPageDate();
  const navigation = getNavigation();
  const metaDataHead = metaDataHeader.getHeader(data);


  return `<!doctype html> 
  <html lang="${langCode}">
    <head>
      <title>cda :: ${this.translate('prints', langCode)} :: ${documentTitle}</title>
      ${metaDataHead}
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0">
      <link href="${this.url('/compiled-assets/main.css')}" rel="stylesheet">
      <link href="${this.url('/assets/images/favicon.svg')}" rel="icon" type="image/svg">
      <script>
        const langCode = "${langCode}";
        const imageStack = ${imageStack};
        const imageBasePath = ${imageBasePath};
        const env = "${this.getENV()}";
        const translations = ${translationsClient};
        const asseturl = "${this.url('/assets')}";
      </script>
    </head>
    <body>
      <div id="page">
        ${navigation}
          <section class="leporello-recog">
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
                  ${inscription}
                  ${stamps}
                </div>
                <div class="block">
                  ${location}
                </div>
                <div class="block">
                  ${ids}
                </div>
              </div>

              <div class="marginal-content">
                ${provenance}
                ${exhibitions}
                ${sources}
                ${additionalTextInformation}
                ${partOfWork}
              </div>
            </div>
          </div>
        </section>

        <section class="leporello-explore">
          <div class="main-image-wrap">
            <figure class="main-image">
              <div class="image-viewer">
                <div id="viewer-content" class="image-viewer__content"></div>
              </div>
              <figcaption class="image-caption-wrap">
                ${imageDescriptionObjectInfo}
                <div id="image-caption" class="image-caption is-secondary has-seperator foldable-block"></div>
              </figcaption>
            </figure>
          </div>
          <div class="explore-content">
            ${imageStripe}
            ${artTechExaminations}
            ${conditionReport}
            ${conservationReport}
            ${relatedInContentTo}
            ${similarTo}
            ${belongsTo}
            ${graphic}
          </div>
        </section>
          <section class="final-words">
          <div class="text-block">
            ${citeCda}
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
      <script src="https://cdn.jsdelivr.net/npm/openseadragon@2.4.2/build/openseadragon/openseadragon.min.js"></script>
      <script src="${this.url('/assets/scripts/main.js')}"></script>
    </body>
  </html>`;
};