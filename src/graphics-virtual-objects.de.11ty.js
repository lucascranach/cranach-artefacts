exports.data = {
  layout: 'graphic-virtual-object-item.11ty.js',
  lang: 'de',
  collectionID: 'graphicsVirtualObjectsDE',
  entityType: 'graphicsVirualObject',
  pagination: {
    data: 'collections.graphicsVirtualObjectsDE',
    size: 1,
    alias: 'graphicsMasterData',
    currentCollection: 'collections.graphicsVirtualObjectsDE',
  },
  permalink: function (data) {
    const item = data.pagination.items[0];
    return `/${data.lang}/${item.metadata.id}/`;
  },
};

exports.render = (data) => data.pagination.items[0];
