const getHeader = require('../_components/header');

let langCode;
let config;

const getLangCode = ({ content }) => {
  return content.metadata.langCode;
}

const getTitle = ({ content }) => {
  return content.metadata.title;
}

const getImage = ({ content }) => {
  const src = content.metadata.imgSrc;
  const alt = content.metadata.title;
  return `
    <figure class="leporello-recog__image">
      <img src="${src}" alt="${this.altText(alt)}">
    </figure>
  `;
}

const getTextBlock = ({ content }) => {
  const attribution = content.involvedPersons.map((item) => {
    const remarks = item.remarks ? `<span class="is-remark">${item.remarks}</span>` : '';
    const alternativeName = item.alternativeName ? `${item.alternativeName}, ` : '';
    return `
        <dd class="definition-list__definition is-block">
         ${alternativeName} ${item.role}${remarks}
        </dd>
      `;
  }
  );

  const historicDateList = content.dating.historicEventInformations.map(date => {
    return `<li>${date.text} ${date.remarks}</li>`;
  });

  const historicDates = content.dating.historicEventInformations.length === 0 ? '' : `
    <div class="foldable-block">
      <button
        class="button is-transparent has-accent unfold-more"
        data-js-expanded="false"
        data-js-expandable="historic-date-list"
        data-text-more="${this.translate('showMore', langCode)}"
        data-text-less="${this.translate('showLess', langCode)}"></button>
      <ul id="historic-date-list" class="simple expandable-content">
        ${historicDateList.join("")}
      </ul>
    </div>
  `;

  return `
    <div class="block">
      <dl class="definition-list">
        
        <dt class="definition-list__term">${this.translate("attribution", langCode)}</dt>
        ${attribution.join("")}

        <dt class="definition-list__term">${this.translate("productionDate", langCode)}</dt>
        <dd class="definition-list__definition">${content.dating.dated} ${content.dating.remarks}</dd>
        ${historicDates}

        <dt class="definition-list__term">${this.translate("dimensions", langCode)}</dt>
        <dd class="definition-list__definition">${content.dimensions.replace(/\n/, "; ")}</dd>

        <dt class="definition-list__term">${this.translate("signature", langCode)}</dt>
        <dd class="definition-list__definition">${content.signature.replace(/\n/, "; ")}</dd>
      </dl>
    </div>
  `;
}

const getCopyText = ({ content }) => {
  const description = content.description ? `${this.markdownify(content.description)}` : '';
  return `
    ${description}
  `;
}

const getLocationBlock = ({ content }) => {

  return `
    <div class="block">

      <dl class="definition-list">
        <dt class="definition-list__term">${this.translate("owner", langCode)}</dt>
        <dd class="definition-list__definition">${content.owner}</dd>

        <dt class="definition-list__term">${this.translate("repository", langCode)}</dt>
        <dd class="definition-list__definition">${content.repository}</dd>

        <dt class="definition-list__term">${this.translate("location", langCode)}</dt>
        <dd class="definition-list__definition">${content.locations[0].term}</dd>
      </dl>

    </div>
  `;
}

const getInscriptionBlock = ({ content }) => {
  const inscription = content.inscription || content.markings ? `
  <dt class="definition-list__term">${this.translate("inscriptions", langCode)}</dt>
  <dd class="definition-list__definition">${content.inscription}${content.markings}</dd>` : '';

  return `
    <div class="block">

      <dl class="definition-list">
        ${inscription}

        <dt class="definition-list__term">CDA ID</dt>
        <dd class="definition-list__definition">${content.metadata.id}</dd>

        <dt class="definition-list__term">${this.translate("objectName", langCode)}</dt>
        <dd class="definition-list__definition">${content.objectName}</dd>
      
        <dt class="definition-list__term">${this.translate("permalink", langCode)}</dt>
        <dd class="definition-list__definition">${content.url}</dd>
      </dl>

    </div>
  `;
}

const getExhibitions = ({ content }) => {
  return !content.exhibitionHistory ? '' : `
    <div class="foldable-block has-strong-separator"> 
      <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="false" data-js-expandable="exhibition-history">${this.translate("exhibitions", langCode)}</h2>
      <div class="expandable-content" id="exhibition-history">
      ${this.markdownify(content.exhibitionHistory)}
      </div>
    </div>`;
};

const getProvenance = ({ content }) => {
  return !content.provenance ? '' : `
    <div class="foldable-block has-strong-separator">
      <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="false" data-js-expandable="provenance">${this.translate("provenance", langCode)}</h2>
      <div class="expandable-content" id="provenance">
      ${this.markdownify(content.provenance)}
      </div>
    </div>
  `;
}

const getSources = ({ content }) => {

  const getLiteraturDetails = (item) => {
    const author = item && item.persons ? item.persons.filter(person => person.role === "AUTHOR").map(person => person.name) : [];
    const publisher = item && item.persons ? item.persons.filter(person => person.role === "PUBLISHER").map(person => person.name) : [];
    const editor = item && item.persons ? item.persons.filter(person => person.role === "EDITORIAL_STAFF").map(person => person.name) : [];
    const alternateNumbers = (!item || !item.alternateNumbers) ? [] : item.alternateNumbers.map(alternateNumber => {
      return `
        ${alternateNumber.dewscription}
        ${alternateNumber.number}
      `;
    });

    const getRow = (content, translationID) => {
      return !content ? '' : `<tr><th>${this.translate(translationID, langCode)}</th><td>${this.stripTags(content)}</td></tr>`;
    };

    return `
      <table class="literature-item-details-table">
        ${getRow(author.join(", "), "author")}
        ${getRow(publisher.join(", "), "publisher")}
        ${getRow(editor.join(", "), "publisher")}
        ${item && item.title ? getRow(item.title, "title") : ''}
        ${item && item.pages ? getRow(item.pages, "pages") : ''}
        ${item && item.series ? getRow(item.series, "series") : ''}
        ${item && item.volume ? getRow(item.volume, "volume") : ''}
        ${item && item.journal ? getRow(item.journal, "journal") : ''}
        ${item && item.issue ? getRow(item.issue, "issue") : ''}
        ${item && item.publication ? getRow(item.publication, "publication") : ''}
        ${item && item.publishDate ? getRow(item.publishDate, "publishDate") : ''}
        ${item && item.publishLocation ? getRow(item.publishLocation, "publishLocation") : ''}
        ${item && item.periodOfOrigin ? getRow(item.periodOfOrigin, "periodOfOrigin") : ''}
        ${item && item.physicalDescription ? getRow(item.physicalDescription, "physicalDescription") : ''}
        ${item && item.mention ? getRow(item.mention, "mention") : ''}
        ${item && item.link ? getRow(item.link, "permalink") : ''}
        ${getRow(alternateNumbers.join(", "), "alternativeNumbers")}
      </table>
    `;
  };

  const publicationList = content.publications.map(
    (item, index) => {
      const literatureReference = this.getLiteratureReference(item.referenceId, langCode);
      const literatureReferenceTableData = this.getLiteratureReferenceTableData(literatureReference, content.metadata.id);
      const hasBackground = index % 2 ? "has-bg" : '';
      return `
        <tr
          class="row ${hasBackground} is-head" 
          id="litRef${item.referenceId}">

          <td class="cell has-interaction"><a href="#" data-js-toggle-literature="${item.referenceId}">${item.title}</a></td>
          <td class="cell">${item.pageNumber}</td>
          <td class="cell">${literatureReferenceTableData.catalogNumber}</td>
          <td class="cell">${literatureReferenceTableData.figureNumber}</td>
        </tr>
        <tr class="row ${hasBackground} is-detail" id="litRefData${item.referenceId}">
          <td class="cell" colspan="4">
            ${getLiteraturDetails(literatureReference)}
          </td>
        </tr>
        `;
    }
  );

  const publications = content.publications ? `
    <div class="foldable-block has-strong-separator"> 
      <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="false" data-js-expandable="literature-list">${this.translate("literature", langCode)}</h2>
      <div id="literature-list" class="expandable-content">
        <table class="table literature">
          <thead class="head">
            <tr class="row">
              <td class="cell" style="width: 40%"></td>
              <td class="cell" style="width: 20%">${this.translate("referenceOnPage", langCode)}</td>
              <td class="cell" style="width: 20%">${this.translate("catalogueNumber", langCode)}</td>
              <td class="cell" style="width: 20%">${this.translate("plate", langCode)}</td>
            </tr>
          </thead>
          <tbody class="body">
          ${publicationList.join("\n")}
          </tbody>
        </table>
      </div>
    </div>` : '';

  return publications;
}

const getImageStack = ({ content }) => {
  return JSON.stringify(content.images);
}

const getImageBasePath = () => {
  return JSON.stringify(config['imageTiles']);
}

const getClientTranslations = () => {
  return JSON.stringify(this.getClientTranslations());
}

const getImageStripe = ({ content }) => {
  const imageStack = content.images;
  const imageTypes = config['imageTypes'];


  const imageStripe = Object.keys(imageTypes).map(key => {

    if (!imageStack || !imageStack[key]) return;

    const images = imageStack[key].images;
    const html = images.map(image => {

      const title = image.metadata && image.metadata ? this.altText(image.metadata.description) : `${key}`;
      return `
        <li
          class="image-stripe-list__item has-interaction"
          data-image-type="${key}" 
          data-image-id="${image.id}"
          data-js-change-image='{"key":"${key}","id":"${image.id}"}'>
          <img src="${image.sizes.xsmall.src}" alt="${title}">
        </li>
      `;
    });
    return (html.join(""));

  });

  const availableImageTypes = Object.keys(imageTypes).map(key => {
    if (!imageStack || !imageStack[key]) return;
    const numberOfImages = imageStack[key].images.length;
    const type = (numberOfImages === 0) ? '' : `<option value="${key}">${this.translate(key, langCode)} (${numberOfImages})</option>`;
    return type;
  });

  const imageTypeSelector = `
    <div class="imagetype-selector">
      <select size="1" data-js-image-selector="true">
        <option value="all">${this.translate('allImages', langCode)}</option>
        ${availableImageTypes.join("")}
      </select>
    </div>
  `;

  return `
    <div class="foldable-block is-sticky">
      <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="true" data-js-expandable="image-stripe">${this.translate("illustrations", langCode)}</h2>
      <div id="image-stripe" class="expandable-content image-stripe">
        <ul class="image-stripe-list">
          ${imageStripe.join("")}
        </ul>
        ${imageTypeSelector}
      </div>
    </div>
  `;
}

const ART_TECH_EXAMINATION = 'ArtTechExamination';
const CONDITION_REPORT = 'ConditionReport';
const CONSERVATION_REPORT = 'ConservationReport';

const getReports = ({ content }, type) => {
  console.log(`- Report Type:${type}`);
  const reports = content.restorationSurveys.filter((rs) => rs.type === type);
  const reportList = reports.reverse().map((report, index) => {

    const imageStripeItems = report.fileReferences.map((file) => {
      const type = file.type;
      const id = file.id;

      if (!content.images || !content.images[type]) return;
      const image = content.images[type].images.filter(image => image.id === id).shift();
      if (!image) return;

      return `
      <li
        class="image-stripe-list__item has-interaction"
        data-image-type="${type}" 
        data-image-id="${id}"
        data-js-change-image='{"key":"${type}","id":"${id}"}'>
        <img src="${image.sizes.xsmall.src}" alt="${type}">
      </li>
      `;
    });
    const imageStripeReport = imageStripeItems.length > 0 ? `<ul class="image-stripe-list">${imageStripeItems.join("")}</ul>` : '';
    const involvedPersonList = report.involvedPersons.map(person => {
      return `<li>${person.role} ${person.name}</li>`;
    })
    const involvedPersons = involvedPersonList.length === 0 ? '' : `
      <ul class="survey-persons">
        ${involvedPersonList.join("")}
      </ul>`;
    const firstItem = report.tests && report.tests.length > 0 ? report.tests[0] : false;
    const surveyTitle = firstItem.purpose;
    const surveyKeywordList = !firstItem ? [] : firstItem.keywords.map(keyword => {
      return `<li>${keyword.name}</li>`;
    });
    const surveyKeywords = surveyKeywordList.length > 0 ? `<ul class="survey-keywords">${surveyKeywordList.join("")}</ul>` : '';
    const surveyContent = report.tests.sort((a, b) => { return a.order - b.order }).map(test => {
      const order = `${test.order.toString().substr(0, 1)}.${test.order.toString().substr(1, 3)}`;

      const text = this.markdownify(test.text.replace(/\n/g, "\n"));
      return `
        <h4 class="survey-kind">${order} ${test.kind}</h4>
        ${text}
      `;
    });

    const project = report.project ? this.markdownify(report.project.replace(/\n/g, "\n\n")) : '';
    const overallAnalysis = report.overallAnalysis ? this.markdownify(report.overallAnalysis.replace(/\n/g, "\n\n")) : '';
    const remarks = report.remarks ? this.markdownify(report.remarks.replace(/\n/g, "\n\n")) : '';
    const getDate = () => {
      const processingDates = report.processingDates;
      return processingDates.beginDate !== processingDates.endDate ? `${processingDates.beginDate} - ${processingDates.endDate}` : processingDates.beginDate;
    }
    const date = report.processingDates ? getDate() : false;
    const surveySlug = this.slugify(`${surveyTitle}-${index}-${type}`);
    const getTitle = () => {
      if (surveyTitle && date) return `<h3 class="survey-title"><span class="is-identifier">${date}</span>${surveyTitle}</h3>`;
      if (date) return `<h3 class="survey-title"><span class="is-identifier">${this.translate("date", langCode)}</span>${date}</h3>`;
      return '';
    }
    const title = getTitle();

    return `
    <div class="survey foldable-block has-separator">
      <header class="survey-header is-expand-trigger" data-js-expanded="false" data-js-expandable="${surveySlug}">
        ${title}
        ${surveyKeywords}
        ${imageStripeReport}
      </header>

      <div class="survey-content expandable-content" id="${surveySlug}">
        ${surveyContent.join("")}
        ${project}
        ${overallAnalysis}
        ${remarks}
        ${involvedPersons}
      </div>
    </div>
    `;
  });


  return (reports && reports.length > 0) ?
    `
    <div class="foldable-block has-strong-separator">
      <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="false" data-js-expandable="report-${type}">${this.translate(type, langCode)}</h2>
      <div id="report-${type}" class="expandable-content">
        ${reportList.join("")}
      </div>
    </div>
    ` : '';
}

const getAdditionalTextInformation = ({ content }) => {
  const additionalInfos = content.additionalTextInformation;
  const additionalInfoTypes = additionalInfos.map(item => item.type);
  const uniqueAdditionalInfoTypes = additionalInfoTypes.filter((item, index) => additionalInfoTypes.indexOf(item) === index);
  const getTypeContent = (type) => {
    const typeContent = additionalInfos.filter(item => item.type === type);
    return typeContent.length === 0 ? '' : typeContent.map(item => `
      <div class="block has-padding">
        ${this.markdownify(item.text)}
      </div>
    `);
  }
  return uniqueAdditionalInfoTypes.length === 0 ? '' : uniqueAdditionalInfoTypes.map(type => {
    return `
    <div class="foldable-block has-strong-separator">
        <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="false" data-js-expandable="${this.slugify(type)}">${type}</h2>
        <div class="expandable-content" id="${this.slugify(type)}">
          ${getTypeContent(type).join("")}
        </div>
      </div>
    `;
  })
}

const getReferences = ({ content }) => {
  const references = content.references.concat(content.secondaryReferences);
  const relatedObjectTypes = this.getRelatedObjectTypes();
  const getTypeContent = (type) => {
    const typeContentItems = references.filter(item => item.kind === type);
    const typeContentItemList = typeContentItems.map(item => {
      const refObjectMeta = this.getReferenceObjectMeta(content.currentCollection, item.inventoryNumber);
      const refObjectLink = `/${langCode}/${this.page.fileSlug}/${refObjectMeta.id}/`;
      return `
        <div class="related-item-wrap">
          <a href="${refObjectLink}">
          <figure class="related-item">
            <div class="related-item__image">
              <img src="${refObjectMeta.imgSrc}" alt="${this.altText(refObjectMeta.title)}">
            </div>
            <figcaption class="related-item__caption">
              <ul>
                <li class="related-item__title">${refObjectMeta.title}</li>
                <li class="related-item__id">${refObjectMeta.id}</li>
                <li class="related-item__text">${refObjectMeta.owner}</li></ul>
            </figcaption>
          </figure>
          </a>
        </div>
      `;
    });

    return typeContentItems.length === 0 ? '' : `
      <div class="foldable-block has-strong-separator">
        <h2 class="foldable-block__headline is-expand-trigger" data-js-expanded="false" data-js-expandable="${this.slugify(type)}">${this.translate(type, langCode)}</h2>
        <div class="expandable-content" id="${this.slugify(type)}">
        ${typeContentItemList.join("")}
        </div>
      </div>
    `;
  }
  const relatedObjectContent = relatedObjectTypes.map(type => {
    return getTypeContent(type);
  });

  return `
    ${relatedObjectContent.join("")}
  `;
}

exports.render = function (data) {
  langCode = getLangCode(data);
  config = this.getConfig();
  data.content.currentCollection = data.collections[data.collectionID];
  data.content.url = `${this.getBaseUrl()}${data.page.url}`;

  this.log(data);

  const header = getHeader(data);
  const title = getTitle(data);
  const image = getImage(data);
  const copy = getCopyText(data);
  const texts = getTextBlock(data);
  const location = getLocationBlock(data);
  const inscription = getInscriptionBlock(data);
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
  const references = getReferences(data);

  return `<!doctype html>
  <html lang="de">
    <head>
      <title>cda // ${this.translate("paintings", langCode)} // ${title}</title>
      ${this.meta()}
      <link href="${this.url('/assets/main.css')}" rel="stylesheet">
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
    
      <section class="leporello-recog">
        ${image}
        <div class="leporello-recog__text">
          ${header}

          <div class="grid-wrapper">
            <div class="main-column">
              <div class="copytext">
                ${copy}
              </div>
              <div class="block">
                ${texts}
              </div>
              <div class="block">
                ${location}
              </div>
              <div class="block">
                ${inscription}
              </div>
            </div>

            <div class="marginal-content">
              ${provenance}
              ${exhibitions}
              ${sources}
              ${additionalTextInformation}
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
            <figcaption id="image-caption"></figcaption>
          </figure>
        </div>
        <div class="explore-content">
          ${imageStripe}
          ${artTechExaminations}
          ${conditionReport}
          ${conservationReport}
          ${references}
        </div>
      </section>

      <script src="https://cdn.jsdelivr.net/npm/openseadragon@2.4.2/build/openseadragon/openseadragon.min.js"></script>
      <script src="${this.url('/assets/scripts/main.js')}"></script>
    </body>
  </html>`;
};
