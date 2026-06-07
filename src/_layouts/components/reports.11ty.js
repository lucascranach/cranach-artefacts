exports.getReports = (eleventy, { content }, langCode, config, type) => {
  const { contentTypes } = config;
  const documentsPath = `${config.documentsBasePath}/${content.inventoryNumber}`;
  const reports = content.restorationSurveys.filter((rs) => rs.type === type);
  const prefix = content.inventoryNumberPrefix;

  const getReportImage = (itemId, itemType) => {
    if (!content.images || !content.images[itemType]) return false;
    // eslint-disable-next-line max-len
    const reportImage = content.images[itemType].images.filter((image) => image.id === itemId).shift();
    if (!reportImage) return false;
    return reportImage;
  };

  const getReportDocument = (itemId, itemType) => {
    if (!content.documents || !content.documents[itemType]) return false;
    // eslint-disable-next-line max-len
    const reportDocument = content.documents[itemType].filter((document) => document.id === itemId).shift();
    if (!reportDocument) return false;
    return reportDocument;
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

      const document = getReportDocument(id, type);
      if (document) otherItems.push({ type, id });
    });
    const imageStripeItems = imageItems.map((item) => `
      <li
        class="image-stripe-list__item has-interaction"
        title="${item.id}" 
        data-image-type="${item.type}" 
        data-image-id="${item.id}"
        data-js-change-image='{"key":"${item.type}","id":"${item.id}"}'>
        <img loading="lazy" src="${item.image.sizes.small.src}" alt="${item.type}" title="${item.id}">
      </li>
      `);
    const documentStripeItems = otherItems.map((item) => {
      const typeData = contentTypes[item.type];
      if (!typeData) return '';
      const fileName = item.id.replace(prefix, '');
      const url = `${documentsPath}/${typeData.sort}_${typeData.fragment}/${fileName}.pdf`;
      eleventy.checkRessource(url);
      return `
      <li>
        <a href="${url}" class="has-interaction is-download-link">
          <span data-filetype="pdf"></span>${fileName}.pdf</a>
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
      const text = eleventy.getFormatedText(test.text.replace(/\n/g, '\n\n'), 'no-lists');
      const surveyKind = test.kind ? `<h4 class="survey-kind">${test.kind}</h4>` : '';
      return `
        ${surveyKind}
        ${text}
      `;
    });

    const project = report.project ? eleventy.markdownify(report.project.replace(/\n/g, '\n\n')) : '';
    const overallAnalysis = report.overallAnalysis ? eleventy.markdownify(report.overallAnalysis.replace(/\n/g, '\n\n')) : '';
    const remarks = report.remarks ? eleventy.markdownify(report.remarks.replace(/\n/g, '\n\n')) : '';
    const getDate = () => {
      const { processingDates } = report;
      return processingDates.beginDate !== processingDates.endDate
        ? `${processingDates.beginDate} - ${processingDates.endDate}` : processingDates.beginDate;
    };
    const date = report.processingDates ? getDate() : false;
    const surveySlug = eleventy.slugify(`${surveyTitle}-${index}-${type}`);
    const getSurveyTitle = () => {
      if (surveyTitle && date) return `<h3 class="survey-title"><span class="is-identifier">${date}</span>${surveyTitle}</h3>`;
      if (date) return `<h3 class="survey-title"><span class="is-identifier">${eleventy.translate('date', langCode)}</span>${date}</h3>`;
      return '';
    };
    const title = getSurveyTitle();

    return `
    <div class="survey foldable-block has-separator">
      <header class="survey-header is-expand-trigger js-expand-trigger" data-js-expanded="true" data-js-expandable="${surveySlug}">
        ${title}
      </header>
        ${surveyKeywords}
        ${documentStripeReport}
        ${imageStripeReport}


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
      <h2 class="foldable-block__headline is-expand-trigger js-expand-trigger"
        data-js-expanded="false" data-js-expandable="report-${type}">
        ${eleventy.translate(type, langCode)}</h2>
      <div id="report-${type}" class="expandable-content">
        ${reportList.join('')}
      </div>
    </div>
    ` : '';
};