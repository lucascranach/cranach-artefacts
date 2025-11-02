exports.getTitle = (eleventy, { content }, langCode) => {
  const prefix = content.metadata.id;
  const titleList = content.titles
    ? content.titles.map((item) => ({ text: item.title, remark: item.remarks }))
    : [];
  const label = titleList.length > 1 ? eleventy.translate('titles', langCode) : eleventy.translate('title', langCode);

  const remarkDataTableData = {
    id: 'Titles',
    content: titleList,
    isAdditionalContentTo: `${prefix}-mainTitle`,
    title: label,
    context: prefix,
  };
  const allTitles = eleventy.getRemarkDataTable(remarkDataTableData);
  const title = content.metadata.title.replace(/<(.*?)>/g, '');
  return `
    <h1 id="${prefix}-mainTitle" class="title">${title}</h1>
    ${allTitles}
  `;
};
