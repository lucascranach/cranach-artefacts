exports.data = {
  layout: 'painting-item.11ty.js',
  lang: 'en',
  collectionID: 'drawingsEN',
  entityType: 'drawings',
  pagination: {
    data: 'collections.drawingsEN',
    size: 1,
    alias: 'drawing',
    currentCollection: 'collections.drawingsEN',
  },
  permalink(data) {
    const item = data.pagination.items[0];
    return `/${data.lang}/${item.metadata.id}/`;
  },
};

exports.render = (data) => data.pagination.items[0];
