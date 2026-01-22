const metadataMappings = require('../../_data/metadata-mappings.json');

const generateDatalist = (fieldId, suggestions) => {
  if (!suggestions || suggestions.length === 0) return '';
  const options = suggestions.map((value) => `<option value="${value}"></option>`).join('');
  return `<datalist id="${fieldId}">${options}</datalist>`;
};

const generateInputField = (fieldConfig) => {
  const {
    formId, label, suggestions = [], type = 'text' 
  } = fieldConfig;

  if (type === 'checkbox') {
    return `
        <div class="input-group input-group--checkbox">
          <input class="input" type="checkbox" data-id="${formId}" id="${formId}">
          <label class="label" for="${formId}">${label}</label>
        </div>`;
  }

  return `
        <div class="input-group">
          <input class="input" type="text" data-id="${formId}" list="${formId}">
          <label class="label">${label}</label>
        </div>
        ${generateDatalist(formId, suggestions)}`;
};

exports.getMetadataDrawer = () => {
  const { fields } = metadataMappings;

  // Generate all input fields based on the fields configuration
  const formFields = fields.map((fieldConfig) => generateInputField(fieldConfig)).join('\n');

  return `
  <div class="drawer" id="metadata-drawer">
  <div class="drawer__header">
    <h2>Metadata Editor</h2>
    <div data-icon="close" class="js-toggle-metadata-drawer" title="Close metadata editor"></div>
  </div>
  <div class="drawer__content meta-data-form">
    <form>
      <div class="message info">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#ffffff"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"></path></svg>
        This is a demo message!
      </div>

      <div class="form-fields">
        ${formFields}
      </div>
      <button id="saveButton">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#ffffff"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"></path></svg>
        <span>Save</span>
      </button>
    </form>
    <div class="clipboard-actions">
      <button id="copyButton">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"></path></svg>
        <span>Copy all metadata</span>
      </button>
      <button id="pasteButton">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"></path></svg>
        <span>Paste all metadata</span>
      </button>
    </div>
    <button id="createNewFileButton" class="hidden">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"></path></svg>
      <span>Create new metadata entry</span>
    </button>

    </div>
  </div>
`;
};
