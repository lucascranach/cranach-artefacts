exports.data = {
  layout: 'painting-item.11ty.js',
  lang: 'de',
  collectionID: 'drawingsDE',
  entityType: 'drawings',
  pagination: {
    data: 'collections.drawingsDE',
    size: 1,
    alias: 'drawing',
    currentCollection: 'collections.drawingsDE',
  },
  permalink(data) {
    const item = data.pagination.items[0];
    return `/${data.lang}/${item.metadata.id}/`;
  },
};

exports.render = (data) => data.pagination.items[0];
