const getSources = (params) => {
  const { eleventy } = params;
  const { content } = params;
  const { langCode } = params;
  const { hasGrayBackground } = params;
  const { title } = params;
  const { type } = params;
  const { publicationListData } = params;
  const { tableStructure } = params;
  const { order } = params;
  const config = eleventy.getConfig();

  const prefix = content.metadata.id;
  const additionalCss = hasGrayBackground ? 'with-gray-background' : '';
  const getLiteraturDetails = (item) => {
    const author = item && item.persons ? item.persons.filter((person) => person.role === 'AUTHOR').map((person) => person.name) : [];
    const publisher = item && item.persons
      ? item.persons.filter((person) => person.role === 'PUBLISHER' || person.role === 'UNKNOWN').map((person) => person.name) : [];
    const editing = item && item.persons ? item.persons.filter((person) => person.role === 'EDITORIAL_STAFF').map((person) => person.name) : [];
    const alternateNumbers = (!item || !item.alternateNumbers) ? []
      : item.alternateNumbers.map((alternateNumber) => `${alternateNumber.description} ${alternateNumber.number}`);

    const getRow = (rowContent, translationID) => (!rowContent ? ''
      : `<tr><th>${eleventy.translate(translationID, langCode)}</th><td>${eleventy.stripTags(rowContent)}</td></tr>`);

    const getLink = (rowContent, translationID) => (!rowContent ? ''
      : `<tr>
          <th>${eleventy.translate(translationID, langCode)}</th>
          <td><a class="has-interaction" href="${eleventy.stripTags(rowContent)}" target="_blank">${eleventy.stripTags(rowContent)}</a></td>
        </tr>`);
    const getLinkToLiteraturePage = () => {
      if (!item) return '';
      const linkToLiteraturePage = `${config.cranachBaseUrl[process.env.ELEVENTY_ENV]}/${langCode}/literature-${item.referenceId}`;

      return `<div class="link-to-item-wrap">
        <a href="${linkToLiteraturePage}" class="link-to-item">${eleventy.translate('showLiterature', langCode)}</a>
      </div>`;
    };

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
        ${item && item.edition ? getRow(item.edition, 'publishEdition') : ''}
        ${item && item.publishDate ? getRow(item.publishDate, 'publishDate') : ''}
        ${item && item.periodOfOrigin ? getRow(item.periodOfOrigin, 'periodOfOrigin') : ''}
        ${item && item.physicalDescription ? getRow(item.physicalDescription, 'physicalDescription') : ''}
        ${item && item.mention ? getRow(item.mention, 'mention') : ''}
        ${item && item.link ? getLink(item.link, 'permalink') : ''}
        ${item && item.copyright ? getLink(item.copyright, 'link') : ''}
        ${item && item.pageNumbers ? getRow(item.pageNumbers, 'pages') : ''}
        ${getRow(alternateNumbers.join(', '), 'alternativeNumbers')}
      </table>

      ${getLinkToLiteraturePage()}
    `;
  };

  const getTableData = (tableDataFields) => {
    const pageNumberCell = `<td class="cell">${tableDataFields.pageNumber}</td>`;
    const catalogNumberCell = `<td class="cell">${tableDataFields.catalogNumber}</td>`;
    const figureNumberCell = `<td class="cell">${tableDataFields.figureNumber}</td>`;
    const empty = '<td class="cell"></td>';
    const data = {
      pageNumberCell, catalogNumberCell, figureNumberCell, empty,
    };

    const outputData = tableStructure.map((entry) => {
      const { field } = entry;
      return data[field];
    });

    return outputData.join('\n');
  };

  const publicationListDataByDate = publicationListData.sort((a, b) => {
    if (!a.referenceData) return 0;
    if (!b.referenceData) return 0;
    const dateA = a.referenceData.publishDate ? a.referenceData.publishDate : a.referenceData.date;
    const dateB = b.referenceData.publishDate ? b.referenceData.publishDate : b.referenceData.date;
    return dateB - dateA;
  });

  const sortedPublicationListData = order === 'old-to-new'
    ? publicationListDataByDate.reverse()
    : publicationListDataByDate;

  const publicationList = sortedPublicationListData.map(
    (item, index) => {
      const litRef = eleventy.getLitRef(item.referenceId, langCode);
      const litRefTableData = eleventy.getLitRefTableData(item.referenceData, content.metadata.id);
      const { pageNumber } = item;
      const catalogNumber = litRefTableData ? litRefTableData.catalogNumber : '';
      const figureNumber = litRefTableData ? litRefTableData.figureNumber : '';
      const tableDataFields = {
        pageNumber, catalogNumber, figureNumber,
      };
      const hasBackground = index % 2 ? 'has-bg' : '';

      return `
        <tr
          class="row ${hasBackground} is-head" 
          id="litRef${item.referenceId}-${index}">

          <td class="cell has-interaction"><a href="#" 
            data-js-toggle-literature="${item.referenceId}-${index}">${item.title}</a></td>
          ${getTableData(tableDataFields, tableStructure)}
        </tr>
        <tr class="row ${hasBackground} is-detail" id="litRefData${item.referenceId}-${index}">
          <td class="cell" colspan="4">
            ${getLiteraturDetails(litRef)}
          </td>
        </tr>
        `;
    },
  );

  const tableHead = tableStructure.map((entry) => {
    const { headline } = entry;
    return `<td class="cell" style="width: 20%">${headline}</td>`;
  });

  const publications = publicationListData.length > 0 ? `
    <div class="foldable-block has-strong-separator"> 
      <h2 class="foldable-block__headline is-expand-trigger js-expand-trigger" data-js-expanded="false" data-js-expandable="${prefix}-${type}-list">
        ${title}</h2>
      <div id="${prefix}-${type}-list" class="expandable-content">
        <table class="table literature">
          <thead class="head ${additionalCss}">
            <tr class="row">
              <td class="cell" style="width: 40%"></td>
              ${tableHead.join('\n')}
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

const getPublicationListData = (eleventy, publications, langCode) => {
  const publicationListData = publications.map((item) => {
    const itemWithReferenceData = item;
    itemWithReferenceData.referenceData = eleventy.getLitRef(item.referenceId, langCode);
    return itemWithReferenceData;
  });

  return publicationListData;
};

exports.getCombinedSources = (eleventy, { content }, langCode, hasGrayBackground = false) => {
  const title = content.entityType ==='archivals'
    ? eleventy.translate('publications', langCode)
    : eleventy.translate('literature', langCode);
  const type = 'combined-literature';
  const tableStructure = [
    {
      headline: eleventy.translate('referenceOnPage', langCode),
      field: 'pageNumberCell',
    },
    {
      headline: eleventy.translate('catalogueNumber', langCode),
      field: 'catalogNumberCell',
    },
    {
      headline: eleventy.translate('plate', langCode),
      field: 'figureNumberCell',
    },
  ];
  const publicationListData = getPublicationListData(eleventy, content.publications, langCode);

  const params = {
    eleventy, content, langCode, hasGrayBackground, title, type, publicationListData, tableStructure,
  };
  return getSources(params);
};

exports.getPrimarySources = (eleventy, { content }, langCode, hasGrayBackground = false) => {
  const title = eleventy.translate('primarySources', langCode);
  const type = 'primary-literature';
  const tableStructure = [
    {
      headline: eleventy.translate('positionInVolume', langCode),
      field: 'pageNumberCell',
    },
    {
      headline: '',
      field: 'empty',
    },
    {
      headline: '',
      field: 'empty',
    },
  ];
  const allPublications = getPublicationListData(eleventy, content.publications, langCode);
  const publicationListData = allPublications.filter((item) => item.referenceData && item.referenceData.isPrimarySource === true);
  const order = 'old-to-new';
  const params = {
    eleventy, content, langCode, hasGrayBackground, title, type, publicationListData, tableStructure, order,
  };
  return getSources(params);
};

exports.getNonPrimarySources = (eleventy, { content }, langCode, hasGrayBackground = false) => {
  const title = eleventy.translate('references', langCode);
  const type = 'non-primary-literature';
  const tableStructure = [
    {
      headline: eleventy.translate('referenceOnPage', langCode),
      field: 'pageNumberCell',
    },
    {
      headline: '',
      field: 'empty',
    },
    {
      headline: '',
      field: 'empty',
    },
  ];
  const allPublications = getPublicationListData(eleventy, content.publications, langCode);
  const publicationListData = allPublications.filter((item) => item.referenceData && item.referenceData.isPrimarySource === false);

  const params = {
    eleventy, content, langCode, hasGrayBackground, title, type, publicationListData, tableStructure,
  };
  return getSources(params);
};
