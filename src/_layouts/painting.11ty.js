const getHeader = require('../_components/header');

let langCode;

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
  const attribution = content.involvedPersons.map(
    (item) => {
      const remarks = item.remarks ? `<span className="remarks">${item.remarks}</span>` : '';
      return `
        <dd class="definition-list__definition">
          ${item.alternativeName}, ${item.role}${remarks}
        </dd>
      `;
    }
  );

  const historicDates = content.dating.historicEventInformations.map(date => {
    return `<dd class="definition-list__definition">${date.text} ${date.remarks}</dd>`;
  });


  return `
    <div class="block">
      <dl class="definition-list">
        
        <dt class="definition-list__term">${this.translate("attribution", langCode)}</dt>
        ${attribution}

        <dt class="definition-list__term">${this.translate("productionDate", langCode)}</dt>
        <dd class="definition-list__definition">${content.dating.dated} ${content.dating.remarks}</dd>
        ${historicDates}

        <dt class="definition-list__term">${this.translate("dimensions", langCode)}</dt>
        <dd class="definition-list__definition">${content.dimensions}</dd>

        <dt class="definition-list__term">${this.translate("signature", langCode)}</dt>
        <dd class="definition-list__definition">${content.signature}</dd>
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
        ${content.owner}

        <dt class="definition-list__term">${this.translate("repository", langCode)}</dt>
        ${content.repository}

        <dt class="definition-list__term">${this.translate("location", langCode)}</dt>
        ${content.locations[0].term}
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

const getSourcesBlock = ({ content }) => {

  const provenance = !content.provenance ? '' : `
    <div class="block">
      <h3 class="is-medium">${this.translate("provenance", langCode)}</h3>
      ${this.markdownify(content.provenance)}
    </div>`;

  const exhibitions = !content.exhibitionHistory ? '' : `
    <div class="block"> 
      <h3 class="is-medium">${this.translate("exhibitions", langCode)}</h3>
      ${this.markdownify(content.exhibitionHistory)}
    </div>`;


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
    <div class="block"> 
      <h3 class="is-medium">${this.translate("literature", langCode)}</h3>
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
    </div>` : '';

  return `
    ${provenance}
    ${exhibitions}
    ${publications}
  `;
}

const getImageStack = ({ content }) => {
  return JSON.stringify(content.images);
}

const getImageBasePath = () => {
  const config = this.getConfig();
  return JSON.stringify(config['imageTiles']);
}

const getTranslations = () => {
  return JSON.stringify(this.getTranslations());
}

const getImageStripe = ({ content }) => {
  const config = this.getConfig();
  const imageStack = content.images;
  const imageTypes = config['imageTypes'];
  
  const imageStripe = Object.keys(imageTypes).map(key => {

    if (!imageStack || !imageStack[key]) return;

    const images = imageStack[key].images;
    const html = images.map(image => {
  
      const title = image.metadata && image.metadata[langCode] ? this.altText(image.metadata[langCode].description) : `${key}`;
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
    const type = (numberOfImages === 0) ? '' : `<option value="${key}">${this.translate(key, langCode)} <span class="is-less-important">#${numberOfImages}</span></option>`;
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
    <div class="foldable-block">
      <h2 class="foldable-block__headline is-expandable" data-js-expanded="true" data-js-expandable="image-stripe">${this.translate("illustrations", langCode)}</h2>
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

const getArtTechExaminations = ({ content }) => {
  const artTechExaminations = content.restorationSurveys.filter((rs) => rs.type === ART_TECH_EXAMINATION);

  const artTechExaminationList = artTechExaminations.reverse().map(artTechExamination => {

    const imageStripeItems = artTechExamination.fileReferences.map((file, index) => {
      const type = file.type;
      const id = file.id;
      
      if (!content.images[type]) return;
      const image = content.images[type].images.filter(image => image.id === id).shift();
      if(!image) return; 
      
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

    const imageStripe = `<ul class="image-stripe-list">${imageStripeItems.join("")}</ul>`;

    const tests = artTechExamination.tests.sort((a, b) => {return a.order-b.order}).map(test => {
      const keywords = test.keywords.map(keyword => { return `<li>${keyword.name}</li>`; });
      const order = `${test.order.toString().substr(0, 1)}.${test.order.toString().substr(1, 3)}`;
      
      const text = this.markdownify(test.text.replace(/\n/g, "\n\n"));
      return `
      <dt class="definition-list__term">${test.purpose}</dt>
      <dd class="definition-list__definition">
        <p>${keywords.join("<br>")}</p>
        ${imageStripe}
        <p>${order} ${test.kind}</p>
        
        ${text}
      </dd>
      `;
    });
    const processingDates = artTechExamination.processingDates;
    const date = processingDates.beginDate !== processingDates.endDate ? `${processingDates.beginDate} - ${processingDates.endDate}` : processingDates.beginDate;

    return `
    <dl class="definition-list is-tight has-small-seperator">
      <dt class="definition-list__term">${this.translate("date", langCode)}</dt>
      <dd class="definition-list__definition">${date}</dd>
      ${tests.join("")}
    </dl>
    `;
  });
  
  return (artTechExaminations && artTechExaminations.length > 0) ? 
    `
    <div class="foldable-block">
      <h2 class="foldable-block__headline is-expandable" data-js-expanded="true" data-js-expandable="art-technological-examination-content">${this.translate("artTechnologicalExamination", langCode)}</h2>
      <div id="art-technological-examination-content" class="expandable-content">
        ${artTechExaminationList.join("")}
      </div>
    </div>
    ` : '';
}

exports.render = function (data) {
  langCode = getLangCode(data);
  data.content.url = `${this.getBaseUrl()}${data.page.url}`;

  const header = getHeader(data);
  const title = getTitle(data);
  const image = getImage(data);
  const copy = getCopyText(data);
  const texts = getTextBlock(data);
  const location = getLocationBlock(data);
  const inscription = getInscriptionBlock(data);
  const sources = getSourcesBlock(data);
  const imageStack = getImageStack(data);
  const imageBasePath = getImageBasePath(data);
  const translations = getTranslations(data);
  const imageStripe = getImageStripe(data);
  const artTechExaminations = getArtTechExaminations(data);

  return `
  <!doctype html>
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
      const translations = ${translations};
      </script>
    </head>
    <body>
    
      <section class="leporello-recog">
        ${image}
        <div class="leporello-recog__text">
          ${header}

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

          ${sources}
          
        </div>
      </section>

      <section class="leporello-explore">
        <div>
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
        </div>

      </section>
    </body>
    <script src="https://cdn.jsdelivr.net/npm/openseadragon@2.4.2/build/openseadragon/openseadragon.min.js"></script>
    <script src="${this.url('/assets/scripts/main.js')}"></script>
  </html>`;
};
