let config;

const metaDataHeader = require('./meta-data-head.11ty');
const improveCda = require('./improve-cda.11ty');
const pageDateSnippet = require('./page-date.11ty');
const copyrightSnippet = require('./copyright.11ty');
const citeCdaSnippet = require('./cite-cda.11ty');
const mediumSnippet = require('./medium.11ty');
const signatureSnippet = require('./signature.11ty');
const inscriptionsAndLabelsSnippet = require('./inscriptions-and-labels.11ty');
const dimensionsSnippet = require('./dimensions.11ty');
const descriptionSnippet = require('./description.11ty');
const locationSnippet = require('./location.11ty');
const imageDescriptionSnippet = require('./image-description.11ty');
const exhibitonsSnippet = require('./exhibitons.11ty');
const identificationSnippet = require('./identification.11ty');
const provenanceSnippet = require('./provenance.11ty');
const sourcesSnippet = require('./sources.11ty');
const imageStripeSnippet = require('./image-stripe.11ty');
const reportsSnippet = require('./reports.11ty');
const additionalTextInformationSnippet = require('./additional-text-information.11ty');
const referencesSnippet = require('./references.11ty');
const conditionSnippet = require('./condition.11ty');
const navigationSnippet = require('./navigation.11ty');
const datingSnippet = require('./dating.11ty');

const ART_TECH_EXAMINATION = 'ArtTechExamination';
const CONDITION_REPORT = 'ConditionReport';
const CONSERVATION_REPORT = 'ConservationReport';
const RELATED_IN_CONTENT_TO = 'RELATED_IN_CONTENT_TO';
const SIMILAR_TO = 'SIMILAR_TO';
const BELONGS_TO = 'BELONGS_TO';
const GRAPHIC = 'GRAPHIC';
const PART_OF_WORK = 'PART_OF_WORK';
const IDENTICAL_WATERMARK = 'IDENTICAL_WATERMARK';
const ON_SAME_SHEET = 'ON_SAME_SHEET';

const getImageStack = ({ content }) => JSON.stringify(content.images);
const getimageBaseUrl = () => JSON.stringify(config.imageTiles);
const getClientTranslations = (eleventy) => JSON.stringify(eleventy.getClientTranslations());
const getDocumentTitle = ({ content }) => content.metadata.title;

// eslint-disable-next-line func-names
exports.getRealObject = function (eleventy, pageData, langCode, masterData) {
  const data = pageData;
  config = eleventy.getConfig();

  eleventy.log(data);

  const { id } = data.content.metadata;
  const documentTitle = getDocumentTitle(data);
  const navigation = navigationSnippet.getNavigation(eleventy, langCode, id);
  const imageStack = getImageStack(data);
  const baseUrl = eleventy.getBaseUrl();
  const imageBaseUrl = getimageBaseUrl(data);
  const translationsClient = getClientTranslations(eleventy);

  const metaDataHead = metaDataHeader.getHeader(data);
  const dimensions = dimensionsSnippet.getDimensions(eleventy, data, langCode);
  const location = locationSnippet.getLocation(eleventy, data, langCode);
  const signature = signatureSnippet.getSignature(eleventy, data, langCode);
  const inscriptionsAndLabels = inscriptionsAndLabelsSnippet.getInscriptionsAndLabels(eleventy, data, langCode);
  const cdaId = identificationSnippet.getCdaId(eleventy, data, langCode);
  const permalink = identificationSnippet.getPermalink(eleventy, data.content.url, langCode);
  const exhibitions = exhibitonsSnippet.getExhibitions(eleventy, data, langCode);
  const provenance = provenanceSnippet.getProvenance(eleventy, data, langCode);
  const primarySources = sourcesSnippet.getPrimarySources(eleventy, data, langCode, true);
  const nonPrimarySources = sourcesSnippet.getNonPrimarySources(eleventy, data, langCode, true);
  const imageStripe = imageStripeSnippet.getImageStripe(eleventy, data, langCode, config, true, false);
  const artTechExaminations = reportsSnippet.getReports(eleventy, data, langCode, config, ART_TECH_EXAMINATION);
  const conditionReport = reportsSnippet.getReports(eleventy, data, langCode, config, CONDITION_REPORT);
  const conservationReport = reportsSnippet.getReports(eleventy, data, langCode, config, CONSERVATION_REPORT);
  const additionalTextInformation = additionalTextInformationSnippet.getAdditionalTextInformation(eleventy, data, langCode);
  const relatedInContentTo = referencesSnippet.getReference(eleventy, data, langCode, RELATED_IN_CONTENT_TO);
  const similarTo = referencesSnippet.getReference(eleventy, data, langCode, SIMILAR_TO);
  const belongsTo = referencesSnippet.getReference(eleventy, data, langCode, BELONGS_TO);
  const graphic = referencesSnippet.getReference(eleventy, data, langCode, GRAPHIC);
  const partOfWork = referencesSnippet.getReference(eleventy, data, langCode, PART_OF_WORK, true);
  const onSameSheet = referencesSnippet.getReference(eleventy, data, langCode, ON_SAME_SHEET);
  const identicalWatermark = referencesSnippet.getReference(eleventy, data, langCode, IDENTICAL_WATERMARK);
  const imageDescriptionObjectInfo = imageDescriptionSnippet.getImageDescriptionObjectInfo(data);
  const citeCda = citeCdaSnippet.getCiteCDA(eleventy, data, langCode);
  const improveCdaSnippet = improveCda.getImproveCDA(eleventy, data, config, langCode);
  const copyright = copyrightSnippet.getCopyright();
  const pageDate = pageDateSnippet.getPageDate(eleventy, langCode);
  const condition = conditionSnippet.getCondition(eleventy, data, langCode);
  const medium = mediumSnippet.getMediumOfGraphic(eleventy, data, langCode);
  const shortDescription = descriptionSnippet.getShortDescription(eleventy, data, langCode);
  const dating = datingSnippet.getDating(eleventy, data, langCode);

  const cranachCollectBaseUrl = eleventy.getCranachCollectBaseUrl();
  const cranachCollectScript = config.cranachCollect.script;

  return `<!doctype html> 
  <html lang="${langCode}">
    <head>
      <title>cda :: ${eleventy.translate('prints', langCode)} :: ${documentTitle}</title>
      ${metaDataHead}
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0">
      <link href="${eleventy.url('/compiled-assets/main.css')}" rel="stylesheet">
      <link href="${eleventy.url('/assets/images/favicon.svg')}" rel="icon" type="image/svg">
      <script>
        const objectData = {};
        objectData.langCode = "${langCode}";
        objectData.imageStack = ${imageStack};
        objectData.baseUrl = "${baseUrl}/${langCode}";
        objectData.imageBaseUrl = ${imageBaseUrl};
        objectData.env = "${eleventy.getENV()}";
        objectData.translations = ${translationsClient};
        objectData.asseturl = "${eleventy.url('/assets')}";
        objectData.inventoryNumber = "${id}";
      </script>
    </head>
    <body>
      <div id="page">
        ${navigation}
        ${masterData}
        <section class="leporello-explore" id="explore">
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
            <div class="block">
              ${condition}
              ${dating}
              ${medium}
              ${shortDescription}
              ${dimensions}
              ${signature}
              ${inscriptionsAndLabels}
              ${cdaId}
              ${permalink}
            </div>
            <div class="block">
              ${location}
            </div>
            ${provenance}
            ${exhibitions}
            ${primarySources}
            ${nonPrimarySources}
            ${additionalTextInformation}
            ${partOfWork}

            ${imageStripe}
            ${artTechExaminations}
            ${conditionReport}
            ${conservationReport}
            ${relatedInContentTo}
            ${similarTo}
            ${belongsTo}
            ${graphic}
            ${onSameSheet}
            ${identicalWatermark}
          </div>
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
      <script src="https://cdn.jsdelivr.net/npm/openseadragon@3.1.0/build/openseadragon/openseadragon.min.js"></script>
      <script src="${eleventy.url('/assets/scripts/main.js')}"></script>
      <script src="${cranachCollectBaseUrl}/${cranachCollectScript}"></script>
    </body>
  </html>`;
};
