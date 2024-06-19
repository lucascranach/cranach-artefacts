exports.getNavigation = (eleventy, langCode, objectId, type) => {
  const config = eleventy.getConfig();

  /* Nav Links ----------------------------------------------------------------- */

  const baseUrlHomepage = config.cranachBaseUrlHomepage[langCode];
  const toCdaHomepage = `
    <a class="button button--is-transparent cda-logo-wrap" href="${baseUrlHomepage}">
      <img class="cda-logo" style="height: 1.2em" src="${eleventy.url('/assets/images/cda-logo-bw.svg')}" alt="CDA Logo">
    </a>
  `;

  const cranachSearchURL = `${config.cranachSearchURL[process.env.ELEVENTY_ENV].replace(/langCode/, langCode)}?kind=works&loadLatestSearchConfiguration=true`;
  const toMainSearch = `
    <a class="button button--is-transparent" href="${cranachSearchURL}">
      <span class="button__icon button__icon--is-large icon has-interaction">apps</span>
      <span class="button__text button__text--is-important">${eleventy.translate('zur-werksuche', langCode)}</span>
    </a>
  `;

  const cranachSearchUrlLiterature = `${config.cranachSearchURL[process.env.ELEVENTY_ENV].replace(/langCode/, langCode)}?kind=literature_references&loadLatestSearchConfiguration=true`;
  const toLiteratureSearch = `
    <a class="button button--is-transparent js-go-to-search" href="${cranachSearchUrlLiterature}">
      <span class="button__icon button__icon--is-large icon has-interaction">reorder</span>
      <span class="button__text button__text--is-important">${eleventy.translate('zur-literatursuche', langCode)}</span>
    </a>
  `;

  const primaryNavigationIterms = type === 'literature' 
    ? `${toCdaHomepage}${toMainSearch}${toLiteratureSearch}`
    : `${toCdaHomepage}${toMainSearch}`;

  /* Lang Switcher --------------------------------------------------------- */
  const languageSwitcherPrefix = type === 'literature' ? "literature-" : "";

  const urlDe = `${eleventy.getBaseUrl()}/de/${languageSwitcherPrefix}${objectId}/`;
  const urlEn = `${eleventy.getBaseUrl()}/en/${languageSwitcherPrefix}${objectId}/`;

  const isActiveDe = langCode === 'de' ? 'lang-selector__item--is-active' : '';
  const isActiveEn = langCode === 'en' ? 'lang-selector__item--is-active' : '';

  const languageSwitcher = `
    <ul class="switcher lang-selector" data-state="inactive" data-component="base/interacting/switcher">
      <li class="switcher-item "><a class="lang-selector__item ${isActiveDe}" href="${urlDe}">DE</a></li>
      <li class="switcher-item "><a class="lang-selector__item ${isActiveEn}" href="${urlEn}">EN</a></li>
    </ul>
  `;

  const metadataDrawerSwitcher = process.env.ELEVENTY_ENV === 'internal' || process.env.ELEVENTY_ENV === 'development'
    ? `<div data-icon="edit_note"
      class="js-toggle-metadata-drawer"
      title="Open metadata editor"
      style="font-size: 1.89rem; color: rgb(255, 204, 0); padding-bottom: 4px;"
    ></div>`
    : '';

  return `
    <nav class="main-navigation js-navigation">
      <div class="primary-navigation">
        ${primaryNavigationIterms}
      </div>
      <div class="secondary-navigation">
        ${metadataDrawerSwitcher}
        <div class="options js-options">
          ${languageSwitcher}
          <button 
            class="button button--is-transparent button__icon button__icon--is-large icon 
            has-interaction options__trigger" data-state="inactive"></button>
        </div>
        <div class="search-result-navigation js-search-result-navigation"></div>
      </div>
    </nav>
  `;
};
